package com.viitorul.auth.security;

import com.viitorul.auth.config.JwtUtils;
import com.viitorul.auth.entity.User;
import com.viitorul.auth.entity.enums.UserRole;
import com.viitorul.auth.repository.UserRepository;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    // ia din ENV sau folosește localhost în dev
    @Value("${FRONTEND_URL:http://localhost:5173}")
    private String frontendUrl;

    // pentru cookie; în prod: Secure=true, SameSite=None
    @Value("${COOKIE_SECURE:true}")
    private boolean cookieSecure;

    @Value("${COOKIE_SAMESITE:None}") // Strict/Lax/None
    private String cookieSameSite;

    // opțional: setează domeniul cookie-ului (ex: .viitorulrachiteni.ro)
    @Value("${COOKIE_DOMAIN:}")
    private String cookieDomain;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        User user = userRepository.findByEmail(email).orElseThrow();
        if (user.getRole() == null) user.setRole(UserRole.USER);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String token = jwtUtils.generateToken(email, user.getRole().name());

        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from("jwt", token)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(Duration.ofDays(7))
                .sameSite(cookieSameSite);

        if (cookieDomain != null && !cookieDomain.isBlank()) {
            builder.domain(cookieDomain);
        }

        response.setHeader(HttpHeaders.SET_COOKIE, builder.build().toString());

        // redirect spre frontendul PUBLIC (nu spre localhost)
        response.sendRedirect(frontendUrl);
    }
}
