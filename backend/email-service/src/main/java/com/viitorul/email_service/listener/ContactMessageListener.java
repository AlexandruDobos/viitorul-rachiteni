// src/main/java/com/viitorul/email_service/listener/ContactMessageListener.java
package com.viitorul.email_service.listener;

import com.viitorul.common.events.ContactMessageEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;

@Slf4j
@Component
@RequiredArgsConstructor
public class ContactMessageListener {

    private final JavaMailSender mailSender;

    // Numele cozii trebuie să fie "contact.message.queue"
    @RabbitListener(queues = "contact.message.queue")
    public void handle(ContactMessageEvent event) {
        try {
            if (event == null || event.getTo() == null || event.getTo().isEmpty()) {
                log.warn("ContactMessageEvent invalid sau fără destinatari: {}", event);
                return;
            }

            MimeMessage mime = mailSender.createMimeMessage();
            // true -> multipart (permite atașamente la nevoie)
            MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");

            // Optional: set FROM dacă vine în event; altfel rămâne default din spring.mail.username
            if (event.getFrom() != null && !event.getFrom().isBlank()) {
                helper.setFrom(event.getFrom());
            }

            helper.setTo(event.getTo().toArray(new String[0]));
            helper.setSubject(event.getSubject() != null ? event.getSubject() : "Mesaj Contact");

            String html = event.getHtml();
            String text = event.getText();

            if (html != null && !html.isBlank()) {
                helper.setText(text != null ? text : stripHtml(html), html); // text + html
            } else {
                helper.setText(text != null ? text : "(fără conținut)", false);
            }

            mailSender.send(mime);
            log.info("Email Contact trimis către {} (subiect: {})", event.getTo(), event.getSubject());
        } catch (Exception e) {
            log.error("Eroare la trimiterea emailului de contact: {}", e.getMessage(), e);
        }
    }

    private String stripHtml(String html) {
        // Fallback foarte simplu pentru text-only
        return html.replaceAll("<br\\s*/?>", "\n")
                .replaceAll("<[^>]+>", "")
                .trim();
    }
}
