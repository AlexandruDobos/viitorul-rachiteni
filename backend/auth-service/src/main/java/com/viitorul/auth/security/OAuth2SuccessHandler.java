package com.viitorul.auth.security;

import com.viitorul.auth.config.JwtUtils;
import com.viitorul.auth.entity.User;
import com.viitorul.auth.entity.enums.AuthProvider;
import com.viitorul.auth.entity.enums.UserRole;
import com.viitorul.auth.repository.UserRepository;
import com.viitorul.auth.service.EventPublisher;
import com.viitorul.common.events.UserRegisteredEvent;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        User user = userRepository.findByEmail(email).orElseThrow();
        user.setRole(user.getRole() != null ? user.getRole() : UserRole.USER);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String token = jwtUtils.generateToken(email, user.getRole().name());

        ResponseCookie jwtCookie = ResponseCookie.from("jwt", token)
                .httpOnly(true)
                .secure(false) // setează true în producție
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .sameSite("Strict") // sau Lax / None dacă frontend-ul e pe alt domeniu
                .build();

        response.setHeader(HttpHeaders.SET_COOKIE, jwtCookie.toString());
        response.sendRedirect("http://localhost:5173"); // asigură-te că e corect portul frontendului
    }

}
