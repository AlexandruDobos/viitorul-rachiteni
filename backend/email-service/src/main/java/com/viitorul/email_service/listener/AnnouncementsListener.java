// src/main/java/com/viitorul/email_service/listener/AnnouncementsListener.java
package com.viitorul.email_service.listener;

import com.viitorul.common.events.AnnouncementPublishedEvent;
import com.viitorul.email_service.config.RabbitMQConfig;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class AnnouncementsListener {

    private final SubscribersClient subscribersClient;
    private final JavaMailSender mailSender;

    @Value("${app.mail.from:}")
    private String from;

    @Value("${app.web-base-url:https://viitorulrachiteni.ro}")
    private String webBaseUrl;

    // Pauză hard-coded între destinatari (200ms). Poți modifica valoarea dacă vrei.
    private static final int SLEEP_MS = 200;

    @RabbitListener(queues = RabbitMQConfig.ANNOUNCEMENTS_QUEUE)
    public void onAnnouncementPublished(AnnouncementPublishedEvent ev) {
        log.info("Announcement event received: id={}, title={}", ev.getId(), ev.getTitle());

        List<String> recipients = subscribersClient.getSubscribedEmails();
        if (recipients.isEmpty()) {
            log.info("No subscribers to notify; skipping.");
            return;
        }

        String subject = "Noutăți ACS Viitorul Răchiteni: " + safe(ev.getTitle());
        String html = buildHtml(ev);

        for (String rcpt : recipients) {
            try {
                MimeMessage mime = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");

                // setăm TO la destinatarul curent
                helper.setTo(rcpt);
                helper.setSubject(subject);
                if (from != null && !from.isBlank()) {
                    helper.setFrom(from);
                }
                helper.setText(html, true);

                // logo inline (opțional)
                try {
                    helper.addInline("logo", new ClassPathResource("mail/logo.png"), "image/png");
                } catch (Exception ignore) { }

                mailSender.send(mime);
                log.info("Announcement email sent to {}", rcpt);

                // pauză mică între trimiteri (protejează împotriva throttling-ului)
                try {
                    Thread.sleep(SLEEP_MS);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    log.warn("Sleep interrupted while sending announcements");
                }
            } catch (Exception e) {
                log.error("Failed to send announcement to {}: {}", rcpt, e.getMessage(), e);
            }
        }
    }

    private String buildHtml(AnnouncementPublishedEvent ev) {
        String title = safe(ev.getTitle());
        String excerpt = safe(ev.getExcerpt());
        String url = ev.getUrl() != null ? ev.getUrl() : webBaseUrl;
        String img = (ev.getCoverUrl() != null && !ev.getCoverUrl().isBlank())
                ? "<img src=\"" + ev.getCoverUrl() + "\" alt=\"cover\" style=\"max-width:100%;border-radius:12px;margin:18px 0;\"/>"
                : "";

        // Totul centrat; fallback link sub buton
        return """
            <!doctype html>
            <html lang="ro">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Noutăți • ACS Viitorul Răchiteni</title>
            </head>
            <body style="margin:0;padding:0;background:#f6f8fb;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;line-height:1.6;color:#111;">
              <!-- preheader, ascuns -->
              <div style="display:none;max-height:0;overflow:hidden;opacity:0;">%s</div>

              <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
                <tr>
                  <td align="center">
                    <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;box-shadow:0 2px 12px rgba(16,24,40,.08);overflow:hidden;">
                      <tr>
                        <td align="center" style="background-image:linear-gradient(90deg,#1e3a8a,#2563eb,#0ea5e9);padding:32px 24px;">
                          <img src="cid:logo" alt="ACS Viitorul Răchiteni" height="84" style="display:block;border:0;outline:none;">
                        </td>
                      </tr>

                      <tr><td style="height:12px"></td></tr>

                      <tr>
                        <td align="center" style="padding:0 28px;">
                          <h1 style="margin:0 0 10px 0;font-size:24px;line-height:1.3;color:#111827;font-weight:800;">%s</h1>
                          <p style="margin:0 0 8px 0;color:#374151;font-size:15px;">%s</p>
                          %s
                          <div style="margin:22px 0 8px 0;text-align:center;">
                            <a href="%s" style="display:inline-block;padding:14px 22px;border-radius:12px;background:#0f172a;color:#ffffff;text-decoration:none;font-weight:800;font-size:14px;box-shadow:0 6px 16px rgba(17,24,39,.15);">
                              Citește anunțul
                            </a>
                          </div>
                          <div style="margin:8px 0 22px 0;text-align:center;font-size:12px;color:#6b7280;">
                            Dacă butonul nu funcționează, deschide linkul:<br>
                            <a href="%s" style="color:#2563eb;text-decoration:none;word-break:break-all;">%s</a>
                          </div>
                        </td>
                      </tr>

                      <tr>
                        <td align="center" style="padding:0 28px 26px 28px;font-size:12px;color:#9ca3af;">
                          Mulțumim,<br>Echipa <strong>ACS Viitorul Răchiteni</strong>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
        """.formatted(excerpt, title, excerpt, img, url, url, url);
    }

    private String safe(String s) {
        if (s == null) return "";
        return s.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;");
    }
}
