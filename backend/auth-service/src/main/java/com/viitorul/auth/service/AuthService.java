// src/main/java/com/viitorul/auth/service/AuthService.java
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
import com.viitorul.common.events.UserRegisteredEvent;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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

    @Value("${COOKIE_SECURE:true}")
    private boolean cookieSecure;

    @Value("${COOKIE_SAMESITE:None}") // Strict / Lax / None
    private String cookieSameSite;

    @Value("${COOKIE_DOMAIN:}") // ex: .viitorulrachiteni.ro
    private String cookieDomain;

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
                .role(UserRole.USER) // 🚨 nu mai acceptăm rol din request, doar USER
                .emailVerified(false)
                .build();

        userRepository.save(user);

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

        // ✅ cookie consistent cu AuthController & OAuth2SuccessHandler
        ResponseCookie.ResponseCookieBuilder cookie =
                ResponseCookie.from("jwt", token)
                        .httpOnly(true)
                        .secure(cookieSecure)
                        .path("/")
                        .maxAge(24 * 60 * 60)
                        .sameSite(cookieSameSite);

        if (cookieDomain != null && !cookieDomain.isBlank()) {
            cookie.domain(cookieDomain);
        }

        response.setHeader(HttpHeaders.SET_COOKIE, cookie.build().toString());

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
        User user = userRepository.findByEmail(email).orElseThrow(UserNotFoundByEmailException::new);

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(30));

        resetTokenRepo.save(resetToken);

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
        user.setEmailVerified(true);
        userRepository.save(user);
        verificationTokenRepository.delete(verification);

        eventPublisher.sendUserAccountActivatedEvent(
                new UserAccountActivatedEvent(user.getName(), user.getEmail())
        );

        return "ok";
    }

    // =========================================
    // 👇 ADĂUGIRI: update profil + schimbare parolă
    // =========================================

    /** Update nume + abonare (subscribe). Valorile null NU se modifică. */
    public void updateProfile(String email, UpdateProfileRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(UserNotFoundByEmailException::new);

        if (req.getName() != null && !req.getName().trim().isEmpty()) {
            user.setName(req.getName().trim());
        }
        if (req.getSubscribe() != null) {
            // presupune existența câmpului boolean subscribedToNews în entitatea User (default false)
            user.setSubscribedToNews(Boolean.TRUE.equals(req.getSubscribe()));
        }

        userRepository.save(user);
    }

    /**
     * Schimbă parola după verificarea parolei curente.
     * (Complexitatea noii parole se validează doar în frontend, conform cerinței tale.)
     */
    public void changePassword(String email, ChangePasswordRequest req) {
        if (req.getCurrentPassword() == null || req.getNewPassword() == null) {
            throw new RuntimeException("Parola curentă și noua parolă sunt necesare.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(UserNotFoundByEmailException::new);

        if (user.getPasswordHash() == null) {
            // cont posibil creat prin OAuth fără parolă locală
            throw new RuntimeException("Acest cont nu are parolă locală.");
        }

        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Parola curentă este incorectă.");
        }

        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }
}
