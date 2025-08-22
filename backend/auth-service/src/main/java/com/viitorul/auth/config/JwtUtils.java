package com.viitorul.auth.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.WeakKeyException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expirationMs:86400000}") // 1 zi
    private int jwtExpirationMs;

    private Key rawKey;   // secret ca text (UTF-8)
    private Key b64Key;   // secret ca Base64 (decodat)

    private Key ensureSigningKey() {
        if (rawKey == null && b64Key == null) {
            // încearcă raw
            try {
                rawKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
            } catch (WeakKeyException e) {
                rawKey = null;
            }
            // încearcă base64
            try {
                byte[] dec = Decoders.BASE64.decode(jwtSecret);
                b64Key = Keys.hmacShaKeyFor(dec);
            } catch (IllegalArgumentException | WeakKeyException e) {
                b64Key = null;
            }
            if (rawKey == null && b64Key == null) {
                throw new IllegalStateException("jwt.secret prea scurt. Minim 32 bytes (256 biți) raw sau Base64.");
            }
        }
        // preferăm raw dacă există (simetric cu App)
        return (rawKey != null) ? rawKey : b64Key;
    }

    private Key getAnyKey() { return ensureSigningKey(); }

    public String generateToken(String email, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getAnyKey())
                .compact();
    }

    public String getEmailFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getAnyKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getAnyKey()).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /** Folosit de /status pentru a extrage claims */
    public Key getKey() {
        return getAnyKey();
    }
}
