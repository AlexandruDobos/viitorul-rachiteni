package com.viitorul.email_service.listener;

import com.viitorul.common.events.UserAccountActivatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.SimpleMailMessage;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserAccountActivatedListener {

    private final JavaMailSender mailSender;

    @RabbitListener(queues = "user.activated.queue")
    public void handleUserAccountActivated(UserAccountActivatedEvent event) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(event.getEmail());
            message.setSubject("Bine ai venit la Viitorul Răchiteni!");
            message.setText("Salut " + event.getName() + ",\n\n"
                    + "Contul tău a fost activat cu succes. Ne bucurăm că faci parte din comunitatea noastră!\n\n"
                    + "Hai Viitorul! 💙🤍");

            mailSender.send(message);
            log.info("Email de bun venit trimis către {}", event.getEmail());

        } catch (Exception e) {
            log.error("Eroare la trimiterea emailului de bun venit către {}: {}", event.getEmail(), e.getMessage(), e);
        }
    }
}
