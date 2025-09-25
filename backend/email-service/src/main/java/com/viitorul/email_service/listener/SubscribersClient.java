package com.viitorul.email_service.listener;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class SubscribersClient {

    private final RestClient restClient = RestClient.create();

    @Value("${AUTH_BASE_URL:http://auth-service:8081}")
    private String authBase;

    public List<String> getSubscribedEmails() {
        ResponseEntity<String[]> res = restClient.get()
                .uri(authBase + "/api/auth/subscribers")
                .retrieve()
                .toEntity(String[].class);
        return Arrays.asList(res.getBody() == null ? new String[0] : res.getBody());
    }
}