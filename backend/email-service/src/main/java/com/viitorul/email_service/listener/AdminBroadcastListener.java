package com.viitorul.email_service.listener;
import com.viitorul.email_service.config.RabbitMQConfig;
import com.viitorul.email_service.dto.BroadcastEmailRequest;
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
public class AdminBroadcastListener {

    private final SubscribersClient subscribersClient;
    private final JavaMailSender mailSender;

    @Value("${app.mail.from:}")
    private String from;

    // mic throttling pentru reputația expeditorului
    private static final int SLEEP_MS = 200;

    @RabbitListener(queues = RabbitMQConfig.ADMIN_BROADCAST_QUEUE)
    public void onAdminBroadcast(BroadcastEmailRequest req) {
        String title = req.getTitle();
        String htmlContent = req.getHtml();

        List<String> recipients = subscribersClient.getSubscribedEmails();
        if (recipients.isEmpty()) {
            log.info("Broadcast ignorat: nu există abonați.");
            return;
        }

        String subject = "ACS Viitorul Răchiteni: " + title;
        String html = buildHtml(title, htmlContent);

        for (String rcpt : recipients) {
            try {
                MimeMessage mime = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");

                helper.setTo(rcpt);
                helper.setSubject(subject);
                if (from != null && !from.isBlank()) helper.setFrom(from);
                helper.setText(html, true);

                try {
                    helper.addInline("logo", new ClassPathResource("mail/logo.png"), "image/png");
                } catch (Exception ignore) {}

                mailSender.send(mime);
                log.info("Broadcast trimis către {}", rcpt);

                try { Thread.sleep(SLEEP_MS); } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    return;
                }
            } catch (Exception e) {
                log.error("Eroare la trimiterea broadcast către {}: {}", rcpt, e.getMessage(), e);
            }
        }
    }

    private String buildHtml(String title, String bodyHtml) {
        return """
        <!doctype html>
        <html lang="ro">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>%s • ACS Viitorul Răchiteni</title>
        </head>
        <body style="margin:0;padding:0;background:#f6f8fb;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;line-height:1.6;color:#111;">
          <!-- preheader, ascuns -->
          <div style="display:none;max-height:0;overflow:hidden;opacity:0;">%s</div>

          <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
            <tr>
              <td align="center">
                <!-- card -->
                <table role="presentation" width="100%%" cellpadding="0" cellspacing="0"
                       style="max-width:640px;background:#ffffff;border-radius:16px;box-shadow:0 2px 12px rgba(16,24,40,.08);overflow:hidden;">
                  <tr>
                    <td align="center" style="background-image:linear-gradient(90deg,#1e3a8a,#2563eb,#0ea5e9);padding:32px 24px;">
                      <img src="cid:logo" alt="ACS Viitorul Răchiteni" height="84"
                           style="display:block;border:0;outline:none;">
                    </td>
                  </tr>

                  <tr><td style="height:12px"></td></tr>

                  <tr>
                    <td align="center" style="padding:0 28px;">
                      <h1 style="margin:0 0 12px 0;font-size:24px;line-height:1.3;color:#111827;font-weight:800;text-align:center;">%s</h1>

                      <!-- CONȚINUT CENTRAT PE MOBIL: nested table -->
                      <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="max-width:560px;">
                        <tr>
                          <td align="left" style="color:#111;font-size:15px;line-height:1.6;">
                            %s
                          </td>
                        </tr>
                      </table>

                      <div style="height:20px"></div>
                    </td>
                  </tr>

                  <tr>
                    <td align="center" style="padding:0 28px 26px 28px;font-size:12px;color:#9ca3af;text-align:center;">
                      Mulțumim,<br/>Echipa <strong>ACS Viitorul Răchiteni</strong>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
    """.formatted(escape(title), escape(title), escape(title), bodyHtml);
    }


    private String escape(String s) {
        if (s == null) return "";
        return s.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;");
    }
}