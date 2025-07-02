package com.viitorul.email_service.events;

import com.viitorul.common.events.UserRegisteredEvent;
import com.viitorul.email_service.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserRegisteredListener {

    private final JavaMailSender mailSender;

    @RabbitListener(queues = RabbitMQConfig.REGISTER_QUEUE)
    public void handleUserRegistered(UserRegisteredEvent event) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(event.getEmail());
        message.setSubject("Welcome, " + event.getName());
        message.setText("Thanks for registering! We’re excited to have you on board.");
        mailSender.send(message);
    }
}

