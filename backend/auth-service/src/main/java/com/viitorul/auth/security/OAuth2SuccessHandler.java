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

        // Update date user + generare token
        User user = userRepository.findByEmail(email).orElseThrow(); // sigur există acum
        user.setRole(UserRole.USER);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String role = "USER";
        String token = jwtUtils.generateToken(email, role);

        Cookie jwtCookie = new Cookie("jwt", token);
        jwtCookie.setHttpOnly(true);
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(7 * 24 * 60 * 60);
        jwtCookie.setSecure(false); // setează true în producție
        jwtCookie.setDomain("localhost");

        response.addCookie(jwtCookie);
        response.sendRedirect("http://localhost:3000/oauth2/success");
    }

}
