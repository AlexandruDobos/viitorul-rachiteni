package com.viitorul.auth.service;

import com.viitorul.auth.config.RabbitMQConfig;
import com.viitorul.common.events.PasswordResetRequestedEvent;
import com.viitorul.common.events.UserAccountActivatedEvent;
import com.viitorul.common.events.UserRegisteredEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventPublisher {
    private final RabbitTemplate rabbitTemplate;

    public void sendUserRegisteredEvent(UserRegisteredEvent event) {
        log.info("Public event: " + event.getEmail());
        rabbitTemplate.convertAndSend(
                "auth.exchange",      // ✅ Exchange
                "auth.registered",    // ✅ Routing key
                event,
                message -> {
                    message.getMessageProperties().setDeliveryMode(org.springframework.amqp.core.MessageDeliveryMode.PERSISTENT);
                    return message;
                }
        );
    }
    public void sendPasswordResetRequestedEvent(PasswordResetRequestedEvent event) {
        rabbitTemplate.convertAndSend("auth.exchange", "auth.reset", event);
    }

    public void sendUserAccountActivatedEvent(UserAccountActivatedEvent event) {
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.AUTH_EXCHANGE,
                "auth.activated", // routing key
                event
        );
    }
}

