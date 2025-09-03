package com.viitorul.email_service.listener;

import com.viitorul.common.events.UserRegisteredEvent;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserRegisteredListener {

    private final JavaMailSender mailSender;


    @Value("${app.confirm-base-url}")
    private String confirmBaseUrl;

    @Value("${app.mail.from:}")
    private String from;

    @RabbitListener(queues = "user.registered.queue")
    public void handleUserRegistered(UserRegisteredEvent event) {
        try {
            String link = UriComponentsBuilder.fromHttpUrl(confirmBaseUrl)
                    .queryParam("token", event.getVerificationToken())
                    .toUriString();

            String html = """
                <!doctype html>
                <html><body style="font-family:Inter, Segoe UI, Helvetica, Arial, sans-serif;background:#f6f8fb;margin:0;padding:0;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
                    <tr><td align="center">
                      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,.06)">
                        <tr><td align="center" style="font-size:22px;font-weight:700;color:#222">Confirmă-ți contul</td></tr>
                        <tr><td style="height:16px"></td></tr>
                        <tr><td style="font-size:14px;color:#333">Salut %s,</td></tr>
                        <tr><td style="font-size:14px;color:#333">Apasă butonul de mai jos pentru a-ți confirma contul:</td></tr>
                        <tr><td style="height:24px"></td></tr>
                        <tr><td align="center">
                          <a href="%s" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#111;color:#fff;text-decoration:none;font-weight:600">Confirmă contul</a>
                        </td></tr>
                        <tr><td style="height:16px"></td></tr>
                        <tr><td style="font-size:12px;color:#666">Dacă butonul nu funcționează, copiază linkul în browser:<br>
                          <a href="%s" style="color:#0a63ff;text-decoration:none">%s</a></td></tr>
                        <tr><td style="height:16px"></td></tr>
                        <tr><td style="font-size:12px;color:#666">Linkul expiră în 30 de minute.</td></tr>
                        <tr><td style="height:24px"></td></tr>
                        <tr><td style="font-size:12px;color:#999">Mulțumim,<br>Echipa Viitorul Răchițeni</td></tr>
                      </table>
                    </td></tr>
                  </table>
                </body></html>
                """.formatted(event.getName(), link, link, link);

            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, "UTF-8");
            helper.setTo(event.getEmail());
            helper.setSubject("Confirmă-ți contul");
            if (!from.isBlank()) {
                helper.setFrom(from);
            }
            helper.setText(html, true);

            mailSender.send(mime);
            log.info("Email de confirmare trimis către {}", event.getEmail());
        } catch (Exception e) {
            log.error("Eroare la trimiterea emailului către {}: {}", event.getEmail(), e.getMessage(), e);
        }
    }
}
