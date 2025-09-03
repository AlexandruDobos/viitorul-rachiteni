package com.viitorul.auth.controller;

import com.viitorul.auth.config.JwtUtils;
import com.viitorul.auth.dto.AuthResponse;
import com.viitorul.auth.dto.LoginRequest;
import com.viitorul.auth.dto.RegisterRequest;
import com.viitorul.auth.dto.ResetPasswordRequest;
import com.viitorul.auth.entity.VerificationToken;
import com.viitorul.auth.service.AuthService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;
import io.jsonwebtoken.security.Keys;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import java.security.Key;
import java.io.IOException;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    @Value("${jwt.secret}")
    private String jwtSecret;
    private final AuthService authService;
    private final JwtUtils jwtUtils;
    // === adaugă aceleași setări ca la setarea cookie-ului ===
    @Value("${COOKIE_SECURE:true}")
    private boolean cookieSecure;

    @Value("${COOKIE_SAMESITE:None}") // Strict / Lax / None
    private String cookieSameSite;

    @Value("${COOKIE_DOMAIN:}")       // ex: .viitorulrachiteni.ro
    private String cookieDomain;
    // in AuthController
    @Value("${FRONTEND_URL:http://localhost:5173}")
    private String frontendUrl;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request,
                                              HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request, response);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(cookieSecure)      // la fel ca la set
                .path("/")                 // la fel
                .sameSite(cookieSameSite)  // la fel
                .maxAge(0);                // ștergere

        if (cookieDomain != null && !cookieDomain.isBlank()) {
            builder.domain(cookieDomain);  // la fel
        }

        response.setHeader(HttpHeaders.SET_COOKIE, builder.build().toString());
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/status")
    public ResponseEntity<?> checkAuth(
            @CookieValue(value = "jwt", required = false) String jwt,
            Authentication authentication) {
        if (jwt != null && !jwt.isEmpty()) {
            try {
                String email = jwtUtils.getEmailFromToken(jwt);
                boolean valid = jwtUtils.validateToken(jwt);
                if (valid) {
                    Claims claims = Jwts.parserBuilder()
                            .setSigningKey(jwtUtils.getKey())
                            .build()
                            .parseClaimsJws(jwt)
                            .getBody();

                    String role = claims.get("role", String.class);

                    return ResponseEntity.ok().body(Map.of(
                            "authenticated", true,
                            "method", "jwt",
                            "email", email,
                            "role", role
                    ));
                }
            } catch (Exception e) {
                // logăm dacă vrei
            }
        }

        return ResponseEntity.ok(Map.of(
                "authenticated", false
        ));
    }


    @GetMapping("/confirm")
    public void confirm(@RequestParam("token") String token, HttpServletResponse response) throws IOException {
        String result = authService.confirmEmail(token);
        if ("ok".equalsIgnoreCase(result)) {
            response.sendRedirect(frontendUrl + "/login?status=success");
        } else {
            // encode ca să nu rupi URL-ul
            String msg = java.net.URLEncoder.encode(result, java.nio.charset.StandardCharsets.UTF_8);
            response.sendRedirect(frontendUrl + "/login?status=error&message=" + msg);
        }
    }

    // in com.viitorul.auth.controller.AuthController
    @GetMapping("/introspect")
    public ResponseEntity<?> introspect(
            @CookieValue(name = "jwt", required = false) String jwtCookie,
            @RequestHeader(name = "Authorization", required = false) String authHeader
    ) {
        String token = null;
        if (jwtCookie != null && !jwtCookie.isBlank()) {
            token = jwtCookie;
        } else if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        if (token == null || !jwtUtils.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Claims claims = Jwts.parserBuilder()
                .setSigningKey(jwtUtils.getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        String email = claims.getSubject();
        String role = claims.get("role", String.class);

        return ResponseEntity.ok(Map.of(
                "email", email,
                "role", role == null ? "" : role
        ));
    }

    @PostMapping("/request-reset")
    public ResponseEntity<String> requestReset(@RequestParam("email") String email) {
        authService.createResetToken(email);
        // nu divulgăm dacă emailul există sau nu
        return ResponseEntity.ok("Dacă adresa există, ți-am trimis un email cu instrucțiuni de resetare.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest req) {
        String result = authService.resetPassword(req.token(), req.newPassword());
        if ("ok".equalsIgnoreCase(result)) {
            return ResponseEntity.ok("Parola a fost resetată cu succes.");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
    }

}