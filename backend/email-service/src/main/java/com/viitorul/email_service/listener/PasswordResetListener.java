package com.viitorul.email_service.listener;

import com.viitorul.common.events.PasswordResetRequestedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PasswordResetListener {

    private final JavaMailSender mailSender;

    @RabbitListener(queues = "auth.reset.queue")
    public void handlePasswordResetRequested(PasswordResetRequestedEvent event) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(event.getEmail());
        message.setSubject("Resetare parolă");
        message.setText(
                "Salut " + event.getName() + ",\n\n" +
                        "Am primit o cerere de resetare a parolei. Apasă pe link-ul de mai jos pentru a seta o parolă nouă:\n\n" +
                        "http://localhost:5173/reset-password?token=" + event.getResetToken() + "\n\n" +
                        "Linkul expiră în 30 de minute."
        );
        mailSender.send(message);
    }
}
