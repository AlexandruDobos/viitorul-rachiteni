package com.viitorul.auth.service;

import com.viitorul.auth.config.RabbitMQConfig;
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
                RabbitMQConfig.REGISTER_QUEUE,
                event,
                message -> {
                    message.getMessageProperties().setDeliveryMode(org.springframework.amqp.core.MessageDeliveryMode.PERSISTENT);
                    return message;
                }
        );
    }
}

