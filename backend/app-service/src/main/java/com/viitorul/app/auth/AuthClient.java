package com.viitorul.app.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class AuthClient {

    @Value("${auth.base-url:http://localhost:8081}")
    private String authBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public AuthUserInfo introspectWithCookie(String jwtCookieValue) {
        HttpHeaders h = new HttpHeaders();
        h.add(HttpHeaders.COOKIE, "jwt=" + jwtCookieValue);
        HttpEntity<Void> req = new HttpEntity<>(h);
        try {
            ResponseEntity<Map> res = restTemplate.exchange(
                    authBaseUrl + "/api/auth/introspect",
                    HttpMethod.GET,
                    req,
                    Map.class
            );
            Map body = res.getBody();
            return new AuthUserInfo((String) body.get("email"), (String) body.get("role"));
        } catch (HttpStatusCodeException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
        }
    }

    public AuthUserInfo introspectWithBearer(String bearer) {
        HttpHeaders h = new HttpHeaders();
        h.add(HttpHeaders.AUTHORIZATION, "Bearer " + bearer);
        HttpEntity<Void> req = new HttpEntity<>(h);
        try {
            ResponseEntity<Map> res = restTemplate.exchange(
                    authBaseUrl + "/api/auth/introspect",
                    HttpMethod.GET,
                    req,
                    Map.class
            );
            Map body = res.getBody();
            return new AuthUserInfo((String) body.get("email"), (String) body.get("role"));
        } catch (HttpStatusCodeException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
        }
    }
}
