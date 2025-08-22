// src/main/java/com/viitorul/app/service/ContactMessageService.java
package com.viitorul.app.service;

import com.viitorul.app.config.RabbitMQConfig;
import com.viitorul.app.dto.ContactMessageRequestDTO;
import com.viitorul.common.events.ContactMessageEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ContactMessageService {

    private final ContactSettingsService contactSettingsService;
    private final RabbitTemplate rabbitTemplate;

    /**
     * Primește cererea din controller, citește lista de destinatari din ContactSettings,
     * construiește subiect + text + HTML și publică un ContactMessageEvent în RabbitMQ.
     */
    public void handle(ContactMessageRequestDTO req) {
        List<String> recipients = contactSettingsService.get().getDestinationEmails();
        if (recipients == null || recipients.isEmpty()) {
            throw new IllegalStateException("Nu există destinatari configurați.");
        }

        String subject = buildSubject(req);
        String html = buildHtml(req);
        String text = buildText(req);

        ContactMessageEvent event = ContactMessageEvent.builder()
                .to(recipients)
                .subject(subject)
                .html(html)
                .text(text)
                .from(null) // lasă email-service să folosească default FROM
                .build();

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.APP_EXCHANGE,
                RabbitMQConfig.CONTACT_ROUTING_KEY,
                event
        );
    }

    /* ===================== Builders ===================== */

    private String buildSubject(ContactMessageRequestDTO req) {
        String who = (req.getName() == null || req.getName().isBlank())
                ? "Anonim"
                : req.getName().trim();
        String when = OffsetDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        return "Mesaj Contact - " + who + " (" + when + ")";
    }

    private String buildText(ContactMessageRequestDTO req) {
        StringBuilder sb = new StringBuilder();
        sb.append("Mesaj nou din pagina Contact").append("\n\n")
                .append("Nume: ").append(nvl(req.getName(), "-")).append("\n")
                .append("Email: ").append(nvl(req.getEmail(), "-")).append("\n")
                .append("Telefon: ").append(nvl(req.getPhone(), "-")).append("\n\n")
                .append("Mesaj:").append("\n")
                .append(nvl(req.getMessage(), "")).append("\n");
        return sb.toString();
    }

    private String buildHtml(ContactMessageRequestDTO req) {
        String safeName = esc(req.getName());
        String safeEmail = esc(req.getEmail());
        String safePhone = esc(req.getPhone());
        String safeMsg = nl2br(esc(req.getMessage()));

        return """
            <div style="font-family:Inter,Arial,sans-serif; font-size:14px; color:#222">
              <h2 style="margin:0 0 8px 0;">Mesaj Contact</h2>
              <p style="margin:0 0 10px 0; color:#666">Ai primit un mesaj de pe site.</p>
              <table cellpadding="6" cellspacing="0" style="border-collapse:collapse">
                <tr>
                  <td style="color:#555">Nume</td>
                  <td><strong>%s</strong></td>
                </tr>
                <tr>
                  <td style="color:#555">Email</td>
                  <td>%s</td>
                </tr>
                <tr>
                  <td style="color:#555">Telefon</td>
                  <td>%s</td>
                </tr>
                <tr>
                  <td style="color:#555; vertical-align:top">Mesaj</td>
                  <td>%s</td>
                </tr>
              </table>
            </div>
            """.formatted(
                nvl(safeName, "-"),
                safeEmail == null ? "-" : ("<a href=\"mailto:" + safeEmail + "\">" + safeEmail + "</a>"),
                nvl(safePhone, "-"),
                nvl(safeMsg, "")
        );
    }

    /* ===================== Helpers ===================== */

    private String nvl(String s, String def) {
        return (s == null || s.isBlank()) ? def : s;
    }

    private String esc(String s) {
        if (s == null) return null;
        // escape minimal pentru HTML
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");
    }

    private String nl2br(String s) {
        if (s == null) return null;
        // păstrează diacritice / UTF-8 (serverul de mail le va trata corect)
        return s.replace("\r\n", "\n")
                .replace("\n", "<br/>");
    }
}
