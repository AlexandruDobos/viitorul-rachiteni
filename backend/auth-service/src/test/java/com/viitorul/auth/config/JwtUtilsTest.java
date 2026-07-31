package com.viitorul.auth.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Base64;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Unit tests for {@link JwtUtils}.
 *
 * These tests exercise the JWT signing / parsing paths in isolation. No Spring
 * context is started; the {@code @Value}-injected fields are set directly via
 * {@link ReflectionTestUtils}. This keeps the tests fast (milliseconds) and
 * makes the intent explicit: we are testing behaviour, not wiring.
 *
 * Template for other pure-unit tests: no {@code @SpringBootTest}, no mocks
 * needed, just plain JUnit 5 + AssertJ.
 */
class JwtUtilsTest {

    // 64 hex chars: alphanumeric only, length is a multiple of 4, and 64 bytes
    // as raw UTF-8. This is simultaneously (a) a valid raw HMAC secret of
    // >= 32 bytes and (b) a syntactically valid Base64 string, so the test
    // doesn't depend on which decode path JwtUtils picks internally.
    private static final String RAW_SECRET =
            "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    private static final int ONE_HOUR_MS = (int) TimeUnit.HOURS.toMillis(1);

    private JwtUtils jwtUtils;

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", RAW_SECRET);
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", ONE_HOUR_MS);
    }

    @Nested
    @DisplayName("generateToken")
    class GenerateToken {

        @Test
        @DisplayName("produces a non-blank JWT with three dot-separated parts")
        void producesStructuredJwt() {
            String token = jwtUtils.generateToken("alice@example.com", "USER");

            assertThat(token).isNotBlank();
            assertThat(token.split("\\.")).hasSize(3);
        }

        @Test
        @DisplayName("embeds the email as subject and the role as a claim")
        void embedsSubjectAndRole() {
            String token = jwtUtils.generateToken("bob@example.com", "ADMIN");

            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(jwtUtils.getKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            assertThat(claims.getSubject()).isEqualTo("bob@example.com");
            assertThat(claims.get("role", String.class)).isEqualTo("ADMIN");
        }

        @Test
        @DisplayName("sets an expiration in the future")
        void setsFutureExpiration() {
            String token = jwtUtils.generateToken("bob@example.com", "USER");

            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(jwtUtils.getKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            assertThat(claims.getExpiration()).isAfter(claims.getIssuedAt());
        }
    }

    @Nested
    @DisplayName("validateToken")
    class ValidateToken {

        @Test
        @DisplayName("returns true for a freshly issued token")
        void validatesFreshToken() {
            String token = jwtUtils.generateToken("carol@example.com", "USER");

            assertThat(jwtUtils.validateToken(token)).isTrue();
        }

        @Test
        @DisplayName("returns false for a token whose signature was tampered with")
        void rejectsTamperedToken() {
            String token = jwtUtils.generateToken("carol@example.com", "USER");
            // Flip a char in the middle of the signature (last segment) so the
            // signature no longer matches, regardless of what character was there.
            int lastDot = token.lastIndexOf('.');
            int midSig = lastDot + (token.length() - lastDot) / 2;
            char original = token.charAt(midSig);
            char flipped = (original == 'A') ? 'B' : 'A';
            String tampered = token.substring(0, midSig) + flipped + token.substring(midSig + 1);

            assertThat(jwtUtils.validateToken(tampered)).isFalse();
        }

        @Test
        @DisplayName("returns false for a syntactically invalid token")
        void rejectsGarbageInput() {
            assertThat(jwtUtils.validateToken("not-even-close-to-a-jwt")).isFalse();
            assertThat(jwtUtils.validateToken("")).isFalse();
        }
    }

    @Nested
    @DisplayName("getEmailFromToken")
    class GetEmailFromToken {

        @Test
        @DisplayName("returns the subject encoded at signing time")
        void returnsSubject() {
            String token = jwtUtils.generateToken("dan@example.com", "USER");

            assertThat(jwtUtils.getEmailFromToken(token)).isEqualTo("dan@example.com");
        }
    }

    @Nested
    @DisplayName("secret parsing")
    class SecretParsing {

        @Test
        @DisplayName("accepts a Base64-encoded secret when raw bytes are too short")
        void acceptsBase64Secret() {
            // "raw" secret shorter than the 32-byte HMAC-SHA256 minimum, but a
            // valid 32-byte key once Base64-decoded.
            byte[] rawKey = new byte[32];
            for (int i = 0; i < rawKey.length; i++) {
                rawKey[i] = (byte) i;
            }
            String base64Secret = Base64.getEncoder().encodeToString(rawKey);

            JwtUtils utils = new JwtUtils();
            ReflectionTestUtils.setField(utils, "jwtSecret", base64Secret);
            ReflectionTestUtils.setField(utils, "jwtExpirationMs", ONE_HOUR_MS);

            String token = utils.generateToken("eve@example.com", "USER");
            assertThat(utils.validateToken(token)).isTrue();
        }

        @Test
        @DisplayName("throws IllegalStateException when the secret is too weak")
        void rejectsWeakSecret() {
            JwtUtils utils = new JwtUtils();
            ReflectionTestUtils.setField(utils, "jwtSecret", "short");
            ReflectionTestUtils.setField(utils, "jwtExpirationMs", ONE_HOUR_MS);

            assertThatThrownBy(() -> utils.generateToken("frank@example.com", "USER"))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("jwt.secret");
        }

        @Test
        @DisplayName("accepts a raw secret that contains non-Base64 characters (e.g. '-')")
        void acceptsRawSecretWithHyphens() {
            // Regression: an earlier version of JwtUtils only caught
            // IllegalArgumentException / WeakKeyException when trying the
            // Base64 path, but jjwt's Decoders.BASE64 actually throws
            // DecodingException on non-base64 chars, which then leaked out
            // of ensureSigningKey and blew up token generation.
            String secretWithHyphens =
                    "a-very-long-secret-that-is-definitely-more-than-32-bytes-1234567890";

            JwtUtils utils = new JwtUtils();
            ReflectionTestUtils.setField(utils, "jwtSecret", secretWithHyphens);
            ReflectionTestUtils.setField(utils, "jwtExpirationMs", ONE_HOUR_MS);

            String token = utils.generateToken("grace@example.com", "USER");
            assertThat(utils.validateToken(token)).isTrue();
            assertThat(utils.getEmailFromToken(token)).isEqualTo("grace@example.com");
        }
    }
}
