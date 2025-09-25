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

import java.util.ArrayList;
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

    // câte adrese punem în BCC per email
    @Value("${app.mail.bcc-batch-size:80}")
    private int batchSize;

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

        // trimitem în batch-uri pe BCC
        for (List<String> chunk : chunked(recipients, batchSize)) {
            try {
                MimeMessage mime = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");

                // Setăm un TO dummy (unii provideri cer TO non-empty); folosim from sau o adresă no-reply
                String to = (from != null && !from.isBlank()) ? from : "no-reply@viitorulrachiteni.ro";
                helper.setTo(to);
                helper.setSubject(subject);
                if (from != null && !from.isBlank()) helper.setFrom(from);
                helper.setBcc(chunk.toArray(String[]::new));
                helper.setText(html, true);

                // logo inline (opțional)
                try {
                    helper.addInline("logo", new ClassPathResource("mail/logo.png"), "image/png");
                } catch (Exception ignore) {}

                mailSender.send(mime);
                log.info("Announcement email sent to BCC batch size={}", chunk.size());
            } catch (Exception e) {
                log.error("Failed to send announcement batch: {}", e.getMessage(), e);
            }
        }
    }

    private String buildHtml(AnnouncementPublishedEvent ev) {
        String title = safe(ev.getTitle());
        String excerpt = safe(ev.getExcerpt());
        String url = ev.getUrl() != null ? ev.getUrl() : webBaseUrl;
        String img = (ev.getCoverUrl() != null && !ev.getCoverUrl().isBlank())
                ? "<img src=\"" + ev.getCoverUrl() + "\" alt=\"cover\" style=\"max-width:100%;border-radius:10px;margin:12px 0;\"/>"
                : "";

        return """
            <!doctype html>
            <html lang="ro">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Noutăți • ACS Viitorul Răchiteni</title>
            </head>
            <body style="margin:0;padding:0;background:#f6f8fb;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;line-height:1.6;color:#222;">
              <div style="display:none;max-height:0;overflow:hidden;opacity:0;">%s</div>
              <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
                <tr>
                  <td align="center">
                    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;box-shadow:0 2px 12px rgba(16,24,40,.08);overflow:hidden;">
                      <tr>
                        <td align="center" style="background:#0b61ff;background-image:linear-gradient(90deg,#1e3a8a,#2563eb,#0ea5e9);padding:30px 20px;">
                          <img src="cid:logo" alt="ACS Viitorul Răchiteni" height="80" style="display:block;border:0;outline:none;">
                        </td>
                      </tr>

                      <tr><td style="height:10px"></td></tr>

                      <tr>
                        <td style="padding:0 28px;">
                          <h1 style="margin:0 0 6px 0;font-size:22px;line-height:1.3;color:#111827;font-weight:800;">%s</h1>
                          <p style="margin:10px 0 12px 0;color:#374151;font-size:15px;">%s</p>
                          %s
                          <p style="margin:18px 0 28px 0;">
                            <a href="%s" style="display:inline-block;padding:14px 22px;border-radius:12px;background:#111827;color:#ffffff;text-decoration:none;font-weight:800;font-size:14px;box-shadow:0 6px 16px rgba(17,24,39,.15);">
                              Citește anunțul
                            </a>
                          </p>
                        </td>
                      </tr>

                      <tr>
                        <td style="padding:0 28px 26px 28px;font-size:12px;color:#9ca3af;">
                          Mulțumim,<br>Echipa <strong>ACS Viitorul Răchiteni</strong>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
        """.formatted(excerpt, title, excerpt, img, url);
    }

    private String safe(String s) {
        if (s == null) return "";
        return s.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;");
    }

    private static <T> List<List<T>> chunked(List<T> list, int size) {
        List<List<T>> out = new ArrayList<>();
        if (size <= 0) size = 50;
        for (int i = 0; i < list.size(); i += size) {
            out.add(list.subList(i, Math.min(i + size, list.size())));
        }
        return out;
    }
}
