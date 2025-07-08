package com.viitorul.auth.service;

import com.viitorul.auth.dto.*;
import com.viitorul.auth.entity.*;
import com.viitorul.auth.entity.enums.AuthProvider;
import com.viitorul.auth.entity.enums.UserRole;
import com.viitorul.auth.exception.EmailAlreadyInUseException;
import com.viitorul.auth.exception.UserNotFoundByEmailException;
import com.viitorul.auth.repository.PasswordResetTokenRepository;
import com.viitorul.auth.repository.UserRepository;
import com.viitorul.auth.config.JwtUtils;
import com.viitorul.auth.repository.VerificationTokenRepository;
import com.viitorul.common.events.PasswordResetRequestedEvent;
import com.viitorul.common.events.UserAccountActivatedEvent;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.viitorul.common.events.UserRegisteredEvent;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final EventPublisher eventPublisher;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final VerificationTokenRepository verificationTokenRepository;
    private final PasswordResetTokenRepository resetTokenRepo;

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
                .emailVerified(false) // ❗ inițial neconfirmat
                .build();

        userRepository.save(user);

        // ✅ Creare token + trimitere eveniment
        String token = createVerificationToken(user);
        eventPublisher.sendUserRegisteredEvent(new UserRegisteredEvent(user.getName(), user.getEmail(), token));

        return new AuthResponse(null, "Te-ai înregistrat. Verifică emailul pentru confirmare.");
    }

    public AuthResponse login(LoginRequest request, HttpServletResponse response) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        if (!user.isEmailVerified()) {
            throw new RuntimeException("Emailul nu a fost confirmat.");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String token = jwtUtils.generateToken(user.getEmail(), user.getRole().name());

        Cookie jwtCookie = new Cookie("jwt", token);
        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(false); // true în producție
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(24 * 60 * 60);
        response.addCookie(jwtCookie);

        return new AuthResponse(null, "Login successful");
    }

    public String createVerificationToken(User user) {
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(user);
        verificationToken.setCreatedAt(LocalDateTime.now());
        verificationToken.setExpiresAt(LocalDateTime.now().plusMinutes(30));
        verificationTokenRepository.save(verificationToken);

        return token;
    }

    public String createResetToken(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() ->
                new UserNotFoundByEmailException());

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(30));

        resetTokenRepo.save(resetToken);

        // 🔔 Trimite eventul
        eventPublisher.sendPasswordResetRequestedEvent(
                new PasswordResetRequestedEvent(user.getName(), user.getEmail(), token)
        );

        return token;
    }


    public String resetPassword(String token, String newPassword) {
        PasswordResetToken reset = resetTokenRepo.findByToken(token).orElse(null);

        if (reset == null || reset.getExpiresAt().isBefore(LocalDateTime.now())) {
            return "Token invalid sau expirat.";
        }

        User user = reset.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        resetTokenRepo.delete(reset);

        return "ok";
    }

    public String confirmEmail(String token) {
        VerificationToken verification = verificationTokenRepository.findByToken(token).orElse(null);

        if (verification == null) {
            return "Link invalid.";
        }

        if (verification.getExpiresAt().isBefore(LocalDateTime.now())) {
            userRepository.delete(verification.getUser());
            verificationTokenRepository.delete(verification);
            return "Link-ul de confirmare a expirat. Contul a fost șters.";
        }

        User user = verification.getUser();
        user.setEmailVerified(true); // ✅ setează confirmarea
        userRepository.save(user);
        verificationTokenRepository.delete(verification);

        //trimit mail de bun venit dupa confirmare de email
        eventPublisher.sendUserAccountActivatedEvent(new UserAccountActivatedEvent(
                user.getName(),
                user.getEmail()
        ));

        return "ok";
    }
}
