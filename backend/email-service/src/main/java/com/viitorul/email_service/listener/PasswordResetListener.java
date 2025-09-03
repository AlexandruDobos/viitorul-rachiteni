package com.viitorul.email_service.listener;

import com.viitorul.common.events.PasswordResetRequestedEvent;
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
public class PasswordResetListener {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:}")
    private String from;

    // Baza pentru link (ex: https://viitorulrachiteni.ro)
    @Value("${app.web-base-url:https://viitorulrachiteni.ro}")
    private String webBaseUrl;

    @RabbitListener(queues = "auth.reset.queue")
    public void handlePasswordResetRequested(PasswordResetRequestedEvent event) {
        try {
            String resetLink = UriComponentsBuilder.fromHttpUrl(webBaseUrl)
                    .path("/reset-password")
                    .queryParam("token", event.getResetToken())
                    .toUriString();

            String html = """
                <!doctype html>
                <html lang="ro">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <title>Resetare parolă • ACS Viitorul Răchiteni</title>
                </head>
                <body style="margin:0;padding:0;background:#f6f8fb;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;line-height:1.6;color:#222;">
                  <!-- preheader (ascuns) -->
                  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
                    Ai cerut resetarea parolei la ACS Viitorul Răchiteni.
                  </div>

                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
                    <tr>
                      <td align="center">
                        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;box-shadow:0 2px 12px rgba(16,24,40,.08);overflow:hidden;">
                          
                          <!-- Header cu logo -->
                          <tr>
                            <td align="center" style="background:#0b61ff;background-image:linear-gradient(90deg,#1e3a8a,#2563eb,#0ea5e9);padding:36px 24px;">
                              <img src="cid:logo" alt="ACS Viitorul Răchiteni" height="96" style="display:block;border:0;outline:none;">
                            </td>
                          </tr>

                          <tr><td style="height:12px"></td></tr>

                          <!-- Titlu -->
                          <tr>
                            <td align="center" style="padding:0 32px">
                              <h1 style="margin:0;font-size:24px;line-height:1.3;color:#1f2937;font-weight:800;">
                                Resetare parolă
                              </h1>
                            </td>
                          </tr>

                          <!-- Intro -->
                          <tr><td style="height:18px"></td></tr>
                          <tr>
                            <td style="padding:0 32px;font-size:15px;color:#374151;">
                              Salut %s,
                              <br><br>
                              Am primit o cerere de resetare a parolei pentru contul tău pe
                              <strong>ACS Viitorul Răchiteni</strong>. Pentru a continua, apasă butonul de mai jos.
                            </td>
                          </tr>

                          <!-- Spațiu înainte de buton -->
                          <tr><td style="height:32px"></td></tr>

                          <!-- Buton -->
                          <tr>
                            <td align="center" style="padding: 32px 32px 32px 32px">
                              <a href="%s"
                                 style="display:inline-block;padding:16px 28px;border-radius:12px;
                                        background:#111827;color:#ffffff;text-decoration:none;
                                        font-weight:800;font-size:15px;box-shadow:0 6px 16px rgba(17,24,39,.15);">
                                Resetează parola
                              </a>
                            </td>
                          </tr>

                          <!-- Spațiu după buton -->
                          <tr><td style="height:32px"></td></tr>

                          <!-- Fallback link -->
                          <tr>
                            <td style="padding:0 32px;font-size:13px;color:#6b7280;">
                              Dacă butonul nu funcționează, copiază linkul în browser:
                              <br>
                              <a href="%s" style="color:#0a63ff;text-decoration:none;word-break:break-all;">%s</a>
                            </td>
                          </tr>

                          <!-- Info -->
                          <tr><td style="height:18px"></td></tr>
                          <tr>
                            <td style="padding:0 32px;font-size:12px;color:#6b7280;">
                              Linkul expiră în 30 de minute. Dacă nu ai inițiat această acțiune, poți ignora emailul.
                            </td>
                          </tr>

                          <!-- Footer -->
                          <tr><td style="height:26px"></td></tr>
                          <tr>
                            <td style="padding:0 32px 30px 32px;font-size:12px;color:#9ca3af;">
                              Mulțumim,
                              <br>
                              Echipa <strong>ACS Viitorul Răchiteni</strong>
                            </td>
                          </tr>

                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(event.getName(), resetLink, resetLink, resetLink);

            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");

            helper.setTo(event.getEmail());
            helper.setSubject("Resetare parolă – ACS Viitorul Răchiteni");
            if (!from.isBlank()) helper.setFrom(from);
            helper.setText(html, true);

            // logo inline
            helper.addInline("logo", new ClassPathResource("mail/logo.png"), "image/png");

            mailSender.send(mime);
            log.info("Email de resetare parolă trimis către {}", event.getEmail());
        } catch (Exception e) {
            log.error("Eroare la trimiterea emailului de resetare către {}: {}", event.getEmail(), e.getMessage(), e);
        }
    }
}
