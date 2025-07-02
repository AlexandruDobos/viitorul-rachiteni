package com.viitorul.auth.service;

import com.viitorul.auth.dto.*;
import com.viitorul.auth.entity.*;
import com.viitorul.auth.entity.enums.AuthProvider;
import com.viitorul.auth.entity.enums.UserRole;
import com.viitorul.auth.exception.EmailAlreadyInUseException;
import com.viitorul.auth.repository.UserRepository;
import com.viitorul.auth.config.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.viitorul.common.events.UserRegisteredEvent;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final EventPublisher eventPublisher;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthResponse register(RegisterRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(existingUser -> {
            throw new EmailAlreadyInUseException();
        });

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .provider(AuthProvider.LOCAL)
                .registeredAt(LocalDateTime.now())
                .role(request.getRole() != null ? request.getRole() : UserRole.USER)
                .build();

        userRepository.save(user);
        UserRegisteredEvent event = new UserRegisteredEvent(user.getName(), user.getEmail());
        eventPublisher.sendUserRegisteredEvent(event);

        String token = jwtUtils.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, "Registration successful");
    }



    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        String token = jwtUtils.generateToken(user.getEmail(), user.getRole().name());

        return new AuthResponse(token, "Login successful");
    }
}