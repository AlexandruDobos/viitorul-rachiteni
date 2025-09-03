package com.viitorul.email_service.listener;

import com.viitorul.common.events.UserRegisteredEvent;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
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
                <html lang="ro">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <title>Confirmă-ți contul</title>
                </head>
                <body style="margin:0;padding:0;background:#f6f8fb;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;line-height:1.6;color:#222;">
                  <!-- preheader (ascuns) -->
                  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
                    Confirmă-ți contul la Viitorul Răchițeni
                  </div>

                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
                    <tr>
                      <td align="center">
                        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;box-shadow:0 2px 12px rgba(16,24,40,.08);overflow:hidden;">
                          
                          <!-- Header cu logo -->
                          <tr>
                            <td align="center" style="background:#0b61ff;background-image:linear-gradient(90deg,#1e3a8a,#2563eb,#0ea5e9);padding:28px 24px;">
                              <img src="cid:logo" alt="ACS Viitorul Răchițeni" height="64" style="display:block;border:0;outline:none;">
                            </td>
                          </tr>

                          <!-- Spacer mare -->
                          <tr><td style="height:8px"></td></tr>

                          <!-- Titlu -->
                          <tr>
                            <td align="center" style="padding:0 32px">
                              <h1 style="margin:0;font-size:22px;line-height:1.3;color:#1f2937;font-weight:800;">
                                Confirmă-ți contul
                              </h1>
                            </td>
                          </tr>

                          <!-- Intro -->
                          <tr><td style="height:16px"></td></tr>
                          <tr>
                            <td style="padding:0 32px;font-size:15px;color:#374151;">
                              Salut %s,
                              <br><br>
                              Apasă butonul de mai jos pentru a-ți confirma contul.
                            </td>
                          </tr>

                          <!-- Buton -->
                          <tr><td style="height:24px"></td></tr>
                          <tr>
                            <td align="center" style="padding:0 32px">
                              <a href="%s"
                                 style="display:inline-block;padding:14px 24px;border-radius:10px;
                                        background:#111827;color:#ffffff;text-decoration:none;
                                        font-weight:700;font-size:14px;">
                                Confirmă contul
                              </a>
                            </td>
                          </tr>

                          <!-- Spacer -->
                          <tr><td style="height:20px"></td></tr>

                          <!-- Fallback link -->
                          <tr>
                            <td style="padding:0 32px;font-size:13px;color:#6b7280;">
                              Dacă butonul nu funcționează, copiază linkul în browser:
                              <br>
                              <a href="%s" style="color:#0a63ff;text-decoration:none;word-break:break-all;">%s</a>
                            </td>
                          </tr>

                          <!-- Info expirare -->
                          <tr><td style="height:16px"></td></tr>
                          <tr>
                            <td style="padding:0 32px;font-size:12px;color:#6b7280;">
                              Linkul expiră în 30 de minute.
                            </td>
                          </tr>

                          <!-- Footer -->
                          <tr><td style="height:24px"></td></tr>
                          <tr>
                            <td style="padding:0 32px 28px 32px;font-size:12px;color:#9ca3af;">
                              Mulțumim,
                              <br>
                              Echipa Viitorul Răchițeni
                            </td>
                          </tr>

                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(event.getName(), link, link, link);

            // multipart=true pentru a putea atașa imagine inline (CID)
            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");

            helper.setTo(event.getEmail());
            helper.setSubject("Confirmă-ți contul");
            if (!from.isBlank()) helper.setFrom(from);
            helper.setText(html, true);

            // atașează logo din classpath ca imagine inline
            helper.addInline("logo", new ClassPathResource("mail/logo.png"), "image/png");

            mailSender.send(mime);
            log.info("Email de confirmare trimis către {}", event.getEmail());
        } catch (Exception e) {
            log.error("Eroare la trimiterea emailului către {}: {}", event.getEmail(), e.getMessage(), e);
        }
    }
}
