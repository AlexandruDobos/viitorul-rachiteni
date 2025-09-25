package com.viitorul.email_service.controller;

import com.viitorul.email_service.config.RabbitMQConfig;
import com.viitorul.email_service.dto.BroadcastEmailRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
public class BroadcastEmailController {

    private final RabbitTemplate rabbitTemplate;

    @PostMapping("/broadcast")
    public ResponseEntity<?> broadcast(@RequestBody BroadcastEmailRequest req) {
        if (req.getTitle() == null || req.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Titlul este obligatoriu.");
        }
        if (req.getHtml() == null || req.getHtml().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Conținutul este obligatoriu.");
        }

        // publicăm payload-ul ca atare; listenerul îl va prelucra
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.APP_EXCHANGE,
                RabbitMQConfig.ADMIN_BROADCAST_ROUTING_KEY,
                req
        );
        return ResponseEntity.accepted().body("Emailul a fost pus în coadă pentru trimitere.");
    }
}

