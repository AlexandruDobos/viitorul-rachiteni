package com.viitorul.app.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.WeakKeyException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;

@Slf4j
@Component
public class JwtUtilsApp {

    @Value("${jwt.secret}")
    private String secret;

    private Key rawKey;   // din UTF-8
    private Key b64Key;   // din Base64 (dacă e cazul)

    @PostConstruct
    public void init() {
        // încearcă mai întâi cheia raw (text), dar nu lăsa aplicația să pice dacă e prea scurtă
        try {
            this.rawKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        } catch (WeakKeyException e) {
            log.warn("jwt.secret (raw) este prea scurt pentru HS256: {}", e.getMessage());
            this.rawKey = null;
        }

        // încearcă și varianta Base64
        try {
            byte[] decoded = Decoders.BASE64.decode(secret);
            this.b64Key = Keys.hmacShaKeyFor(decoded);
        } catch (IllegalArgumentException | WeakKeyException e) {
            // nu este Base64 valid sau rezultat prea scurt
            this.b64Key = null;
            log.warn("jwt.secret nu este Base64 valid sau e prea scurt ca Base64: {}", e.getMessage());
        }

        if (rawKey == null && b64Key == null) {
            throw new IllegalStateException(
                    "jwt.secret este prea scurt. Setează un secret de minimum 256 biți (≥32 bytes) " +
                            "fie ca text brut, fie ca Base64, și folosește același secret în Auth și App."
            );
        }
    }

    private Claims parseWith(Key key, String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .setAllowedClockSkewSeconds(120)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Claims parse(String token) {
        RuntimeException last = null;
        if (rawKey != null) {
            try { return parseWith(rawKey, token); } catch (RuntimeException e) { last = e; }
        }
        if (b64Key != null) {
            try { return parseWith(b64Key, token); } catch (RuntimeException e) { last = e; }
        }
        throw (last != null) ? last : new JwtException("JWT parse failed");
    }

    public boolean valid(String token) {
        try { parse(token); return true; } catch (RuntimeException e) { return false; }
    }

    public String getEmail(String token) {
        Claims c = parse(token);
        String email = c.get("email", String.class);
        if (email == null || email.isBlank()) email = c.getSubject();
        return email;
    }
}
