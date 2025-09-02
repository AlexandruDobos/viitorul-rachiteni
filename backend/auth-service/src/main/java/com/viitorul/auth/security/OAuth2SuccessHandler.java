package com.viitorul.auth.security;

import com.viitorul.auth.config.JwtUtils;
import com.viitorul.auth.entity.User;
import com.viitorul.auth.entity.enums.AuthProvider;
import com.viitorul.auth.entity.enums.UserRole;
import com.viitorul.auth.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    @Value("${FRONTEND_URL:http://localhost:5173}")
    private String frontendUrl;

    @Value("${COOKIE_SECURE:true}")
    private boolean cookieSecure;

    @Value("${COOKIE_SAMESITE:None}") // Strict/Lax/None
    private String cookieSameSite;

    @Value("${COOKIE_DOMAIN:}")
    private String cookieDomain;

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oauthUser = (OAuth2User) oauthToken.getPrincipal();
        Map<String, Object> attrs = oauthUser.getAttributes();

        // registrationId: "google", "github", etc.
        String provider = oauthToken.getAuthorizedClientRegistrationId();
        String providerUpper = provider == null ? "OAUTH" : provider.toUpperCase();

        String email = asString(attrs.get("email"));
        String name  = firstNonEmpty(asString(attrs.get("name")), asString(attrs.get("given_name")));
        String sub   = asString(attrs.get("sub")); // Google subject (stable ID)
        Boolean emailVerified = asBoolean(attrs.get("email_verified"));

        if (email == null || email.isBlank()) {
            log.warn("OAuth2 success without email. provider={}, attrs={}", provider, attrs);
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Email not provided by OAuth provider");
            return;
        }

        // create-if-absent
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User u = new User();
            u.setEmail(email);
            u.setName(name);
            u.setProvider(AuthProvider.valueOf(providerUpper));   // dacă ai enum: u.setProvider(Provider.valueOf(providerUpper));
            u.setProviderId(sub);
            u.setRole(Optional.ofNullable(u.getRole()).orElse(UserRole.USER));
            u.setRegisteredAt(LocalDateTime.now());
            u.setEmailVerified(Boolean.TRUE.equals(emailVerified));
            return userRepository.save(u);
        });

        // update fields on every login
        user.setLastLoginAt(LocalDateTime.now());
        if (user.getName() == null && name != null) user.setName(name);
        if (user.getProviderId() == null && sub != null) user.setProviderId(sub);
        if (user.getRole() == null) user.setRole(UserRole.USER);
        userRepository.save(user);

        // issue JWT
        String token = jwtUtils.generateToken(email, user.getRole().name());

        ResponseCookie.ResponseCookieBuilder cookie =
                ResponseCookie.from("jwt", token)
                        .httpOnly(true)
                        .secure(cookieSecure)
                        .path("/")
                        .maxAge(Duration.ofDays(7))
                        .sameSite(cookieSameSite);
        if (cookieDomain != null && !cookieDomain.isBlank()) {
            cookie.domain(cookieDomain);
        }
        response.setHeader(HttpHeaders.SET_COOKIE, cookie.build().toString());

        response.sendRedirect("https://www.viitorulrachiteni.ro/");
    }

    private static String asString(Object o) {
        return o == null ? null : String.valueOf(o);
    }

    private static boolean asBoolean(Object o) {
        return (o instanceof Boolean b) ? b : "true".equalsIgnoreCase(asString(o));
    }

    private static String firstNonEmpty(String a, String b) {
        return (a != null && !a.isBlank()) ? a : (b != null && !b.isBlank() ? b : null);
    }
}
