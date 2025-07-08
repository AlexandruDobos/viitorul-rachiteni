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
        Cookie cookie = new Cookie("jwt", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // true in prod
        cookie.setPath("/");
        cookie.setMaxAge(0); // delete cookie
        response.addCookie(cookie);
        return ResponseEntity.ok().build();
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

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "authenticated", false
        ));
    }


    @GetMapping("/confirm")
    public void confirmEmail(@RequestParam("token") String token, HttpServletResponse response) throws IOException {
        String result = authService.confirmEmail(token);

        if (result.equals("ok")) {
            response.sendRedirect("http://localhost:5173/login?status=success");
        } else {
            response.sendRedirect("http://localhost:5173/login?status=error&message=" + java.net.URLEncoder.encode(result, "UTF-8"));
        }
    }

    @PostMapping("/request-reset")
    public ResponseEntity<String> requestResetToken(@RequestParam("email") String email) {
        String token = authService.createResetToken(email);

        // Aici trimiți emailul cu linkul de resetare, dacă vrei
        return ResponseEntity.ok("Token generat. Verifică emailul.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        String result = authService.resetPassword(request.token(), request.newPassword());
        if (!result.equals("ok")) return ResponseEntity.badRequest().body(result);
        return ResponseEntity.ok("Parola a fost resetată.");
    }


}
