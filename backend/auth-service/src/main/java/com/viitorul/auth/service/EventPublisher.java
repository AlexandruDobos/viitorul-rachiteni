package com.viitorul.auth.service;

import com.viitorul.auth.config.RabbitMQConfig;
import com.viitorul.common.events.UserRegisteredEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EventPublisher {
    private final RabbitTemplate rabbitTemplate;

    public void sendUserRegisteredEvent(UserRegisteredEvent event) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.REGISTER_QUEUE, event);
    }
}

