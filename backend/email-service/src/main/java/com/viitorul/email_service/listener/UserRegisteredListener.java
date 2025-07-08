package com.viitorul.email_service.listener;

import com.viitorul.common.events.UserRegisteredEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.SimpleMailMessage;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserRegisteredListener {

    private final JavaMailSender mailSender;

    @RabbitListener(queues = "user.registered.queue")
    public void handleUserRegistered(UserRegisteredEvent event) {
        try {
            String link = "http://localhost:8080/api/auth/confirm?token=" + event.getVerificationToken();

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(event.getEmail());
            message.setSubject("Confirmă-ți contul");
            message.setText("Salut " + event.getName() + ",\n\nConfirmă-ți contul accesând linkul:\n" + link +
                    "\n\nLinkul expiră în 30 de minute.");

            mailSender.send(message);
            log.info("Email trimis către {}", event.getEmail());

        } catch (Exception e) {
            log.error("Eroare la trimiterea emailului către {}: {}", event.getEmail(), e.getMessage(), e);
            // Eventual poți trimite o notificare alternativă sau marca eșecul
        }
    }

}
