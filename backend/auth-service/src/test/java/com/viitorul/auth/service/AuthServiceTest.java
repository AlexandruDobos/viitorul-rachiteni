package com.viitorul.auth.service;

import com.viitorul.auth.config.JwtUtils;
import com.viitorul.auth.dto.LoginRequest;
import com.viitorul.auth.dto.RegisterRequest;
import com.viitorul.auth.dto.UpdateAccountRequest;
import com.viitorul.auth.entity.PasswordResetToken;
import com.viitorul.auth.entity.User;
import com.viitorul.auth.entity.VerificationToken;
import com.viitorul.auth.entity.enums.AuthProvider;
import com.viitorul.auth.entity.enums.UserRole;
import com.viitorul.auth.exception.EmailAlreadyInUseException;
import com.viitorul.auth.exception.UserNotFoundByEmailException;
import com.viitorul.auth.repository.PasswordResetTokenRepository;
import com.viitorul.auth.repository.UserRepository;
import com.viitorul.auth.repository.VerificationTokenRepository;
import com.viitorul.common.events.PasswordResetRequestedEvent;
import com.viitorul.common.events.UserRegisteredEvent;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link AuthService}.
 *
 * Covers the security-critical paths:
 *   - registration refuses to overwrite an existing email,
 *   - login rejects a wrong password AND rejects unverified accounts,
 *   - password reset only works with a non-expired token,
 *   - {@code updateAccount} refuses to blank the name and validates the
 *     current password before changing it.
 *
 * All external collaborators are mocked; {@code @Value}-injected fields are
 * set via {@link ReflectionTestUtils} so we don't need Spring at all.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private EventPublisher eventPublisher;
    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtils jwtUtils;
    @Mock private VerificationTokenRepository verificationTokenRepository;
    @Mock private PasswordResetTokenRepository resetTokenRepo;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "cookieSecure", true);
        ReflectionTestUtils.setField(authService, "cookieSameSite", "None");
        ReflectionTestUtils.setField(authService, "cookieDomain", "");
    }

    // ---------- fixtures ----------

    private User verifiedUser(String email) {
        return User.builder()
                .id(1L)
                .name("Alice")
                .email(email)
                .passwordHash("hashed")
                .role(UserRole.USER)
                .provider(AuthProvider.LOCAL)
                .emailVerified(true)
                .subscribedToNews(true)
                .build();
    }

    private RegisterRequest registerReq(String email) {
        RegisterRequest r = new RegisterRequest();
        r.setName("Alice");
        r.setEmail(email);
        r.setPassword("password123");
        return r;
    }

    private LoginRequest loginReq(String email, String password) {
        LoginRequest r = new LoginRequest();
        r.setEmail(email);
        r.setPassword(password);
        return r;
    }

    // ---------- tests ----------

    @Nested
    @DisplayName("register")
    class Register {

        @Test
        @DisplayName("saves a new USER, generates a verification token, and publishes a registered event")
        void savesNewUserAndPublishesEvent() {
            when(userRepository.findByEmail("new@example.com")).thenReturn(Optional.empty());
            when(passwordEncoder.encode("password123")).thenReturn("hashed");
            when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

            authService.register(registerReq("new@example.com"));

            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());
            User saved = userCaptor.getValue();

            assertThat(saved.getEmail()).isEqualTo("new@example.com");
            assertThat(saved.getPasswordHash()).isEqualTo("hashed");
            assertThat(saved.getRole()).isEqualTo(UserRole.USER);
            assertThat(saved.getProvider()).isEqualTo(AuthProvider.LOCAL);
            assertThat(saved.isEmailVerified()).isFalse();
            assertThat(saved.isSubscribedToNews()).isTrue();

            verify(verificationTokenRepository).save(any(VerificationToken.class));
            verify(eventPublisher).sendUserRegisteredEvent(any(UserRegisteredEvent.class));
        }

        @Test
        @DisplayName("throws EmailAlreadyInUseException when a user with the same email exists")
        void refusesDuplicateEmail() {
            when(userRepository.findByEmail("dup@example.com"))
                    .thenReturn(Optional.of(verifiedUser("dup@example.com")));

            assertThatThrownBy(() -> authService.register(registerReq("dup@example.com")))
                    .isInstanceOf(EmailAlreadyInUseException.class);

            verify(userRepository, never()).save(any());
            verify(eventPublisher, never()).sendUserRegisteredEvent(any());
        }
    }

    @Nested
    @DisplayName("login")
    class Login {

        private final HttpServletResponse response = mock(HttpServletResponse.class);

        @Test
        @DisplayName("sets a JWT cookie and updates lastLoginAt on success")
        void successPath() {
            User user = verifiedUser("alice@example.com");
            when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("password123", "hashed")).thenReturn(true);
            when(jwtUtils.generateToken("alice@example.com", "USER")).thenReturn("jwt-token");
            when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

            authService.login(loginReq("alice@example.com", "password123"), response);

            ArgumentCaptor<String> cookieCaptor = ArgumentCaptor.forClass(String.class);
            verify(response).setHeader(eq("Set-Cookie"), cookieCaptor.capture());
            String setCookie = cookieCaptor.getValue();

            assertThat(setCookie)
                    .contains("jwt=jwt-token")
                    .contains("HttpOnly")
                    .contains("Secure")
                    .contains("SameSite=None")
                    .contains("Path=/");

            assertThat(user.getLastLoginAt())
                    .as("login updates the timestamp")
                    .isNotNull()
                    .isBeforeOrEqualTo(LocalDateTime.now());
        }

        @Test
        @DisplayName("rejects wrong password")
        void wrongPassword() {
            User user = verifiedUser("alice@example.com");
            when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

            assertThatThrownBy(() -> authService.login(loginReq("alice@example.com", "wrong"), response))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Invalid credentials");

            verify(jwtUtils, never()).generateToken(any(), any());
            verifyNoInteractions(response);
        }

        @Test
        @DisplayName("rejects users whose email is not yet verified")
        void rejectsUnverifiedUser() {
            User user = verifiedUser("alice@example.com");
            user.setEmailVerified(false);
            when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("password123", "hashed")).thenReturn(true);

            assertThatThrownBy(() -> authService.login(loginReq("alice@example.com", "password123"), response))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Emailul nu a fost confirmat");
        }

        @Test
        @DisplayName("rejects unknown email with the same 'Invalid credentials' error (no info leak)")
        void rejectsUnknownEmail() {
            when(userRepository.findByEmail("nobody@example.com")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.login(loginReq("nobody@example.com", "any"), response))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Invalid credentials");
        }
    }

    @Nested
    @DisplayName("resetPassword")
    class ResetPassword {

        @Test
        @DisplayName("returns error string when the token is unknown")
        void unknownToken() {
            when(resetTokenRepo.findByToken("nope")).thenReturn(Optional.empty());

            String result = authService.resetPassword("nope", "newpw");

            assertThat(result).contains("invalid").containsIgnoringCase("expirat");
            verify(passwordEncoder, never()).encode(any());
        }

        @Test
        @DisplayName("returns error string when the token exists but is expired")
        void expiredToken() {
            User user = verifiedUser("alice@example.com");
            PasswordResetToken expired = new PasswordResetToken();
            expired.setToken("expired-token");
            expired.setUser(user);
            expired.setExpiresAt(LocalDateTime.now().minusMinutes(1));

            when(resetTokenRepo.findByToken("expired-token")).thenReturn(Optional.of(expired));

            String result = authService.resetPassword("expired-token", "newpw");

            assertThat(result).containsIgnoringCase("expirat");
            verify(passwordEncoder, never()).encode(any());
            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("updates the password and deletes the token on success")
        void happyPath() {
            User user = verifiedUser("alice@example.com");
            PasswordResetToken token = new PasswordResetToken();
            token.setToken("valid-token");
            token.setUser(user);
            token.setExpiresAt(LocalDateTime.now().plusMinutes(30));

            when(resetTokenRepo.findByToken("valid-token")).thenReturn(Optional.of(token));
            when(passwordEncoder.encode("newpw")).thenReturn("new-hashed");

            String result = authService.resetPassword("valid-token", "newpw");

            assertThat(result).isEqualTo("ok");
            assertThat(user.getPasswordHash()).isEqualTo("new-hashed");
            verify(userRepository).save(user);
            verify(resetTokenRepo).delete(token);
        }
    }

    @Nested
    @DisplayName("createResetToken")
    class CreateResetToken {

        @Test
        @DisplayName("throws when the email is unknown")
        void throwsWhenUnknownEmail() {
            when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.createResetToken("ghost@example.com"))
                    .isInstanceOf(UserNotFoundByEmailException.class);

            verify(resetTokenRepo, never()).save(any());
            verify(eventPublisher, never()).sendPasswordResetRequestedEvent(any());
        }

        @Test
        @DisplayName("persists the token and publishes a reset event")
        void happyPath() {
            User user = verifiedUser("alice@example.com");
            when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));

            String token = authService.createResetToken("alice@example.com");

            assertThat(token).isNotBlank();
            verify(resetTokenRepo).save(any(PasswordResetToken.class));
            verify(eventPublisher).sendPasswordResetRequestedEvent(any(PasswordResetRequestedEvent.class));
        }
    }

    @Nested
    @DisplayName("updateAccount")
    class UpdateAccount {

        @Test
        @DisplayName("silently returns when the request body is null")
        void nullRequestIsNoOp() {
            authService.updateAccount("alice@example.com", null);

            verifyNoInteractions(userRepository, passwordEncoder);
        }

        @Test
        @DisplayName("throws when an explicit empty name is provided")
        void refusesEmptyName() {
            User user = verifiedUser("alice@example.com");
            when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));

            UpdateAccountRequest req = new UpdateAccountRequest();
            req.setName("   ");

            assertThatThrownBy(() -> authService.updateAccount("alice@example.com", req))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("gol");
        }

        @Test
        @DisplayName("changes the password only after verifying the current one")
        void changesPasswordWhenCurrentMatches() {
            User user = verifiedUser("alice@example.com");
            when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("old", "hashed")).thenReturn(true);
            when(passwordEncoder.encode("new-pw")).thenReturn("new-hashed");

            UpdateAccountRequest req = new UpdateAccountRequest();
            req.setCurrentPassword("old");
            req.setNewPassword("new-pw");

            authService.updateAccount("alice@example.com", req);

            assertThat(user.getPasswordHash()).isEqualTo("new-hashed");
            verify(userRepository).save(user);
        }

        @Test
        @DisplayName("refuses to change the password when the current one is wrong")
        void refusesPasswordChangeWhenCurrentIsWrong() {
            User user = verifiedUser("alice@example.com");
            when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("bad", "hashed")).thenReturn(false);

            UpdateAccountRequest req = new UpdateAccountRequest();
            req.setCurrentPassword("bad");
            req.setNewPassword("new-pw");

            assertThatThrownBy(() -> authService.updateAccount("alice@example.com", req))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("incorect");

            assertThat(user.getPasswordHash()).isEqualTo("hashed");
        }
    }
}
