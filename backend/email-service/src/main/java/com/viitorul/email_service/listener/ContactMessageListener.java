// src/main/java/com/viitorul/email_service/listener/ContactMessageListener.java
package com.viitorul.email_service.listener;

import com.viitorul.common.events.ContactMessageEvent;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ContactMessageListener {

    private final JavaMailSender mailSender;

    /** Adresa din care trimiți (de pe domeniul tău), ex: contact@viitorulrachiteni.ro */
    @Value("${app.mail.from:}")
    private String fromAddress;

    @RabbitListener(queues = "contact.message.queue")
    public void handle(ContactMessageEvent event) {
        try {
            if (event == null || event.getTo() == null || event.getTo().isEmpty()) {
                log.warn("ContactMessageEvent invalid sau fără destinatari: {}", event);
                return;
            }

            final String now = LocalDateTime.now()
                    .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));

            // Subiect cu fallback
            final String subject = isBlank(event.getSubject())
                    ? "Mesaj Contact – " + now
                    : event.getSubject();

            // Conținut HTML (preferă event.html, altfel transformă textul în HTML)
            final String innerHtml = !isBlank(event.getHtml())
                    ? event.getHtml()
                    : escapeHtml(nvl(event.getText()))
                    .replace("\r\n", "\n")
                    .replace("\n", "<br>");

            // Ambalaj HTML (șablon) – logo inline cu CID: logo
            final String html = """
                <!doctype html>
                <html lang="ro">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <title>%s</title>
                </head>
                <body style="margin:0;padding:0;background:#f6f8fb;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;line-height:1.55;color:#111827;">
                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="padding:28px 0;">
                    <tr>
                      <td align="center">
                        <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;box-shadow:0 2px 12px rgba(16,24,40,.08);overflow:hidden;">
                          
                          <!-- Header -->
                          <tr>
                            <td align="center" style="background-image:linear-gradient(90deg,#1e3a8a,#2563eb,#0ea5e9);padding:26px 20px;">
                              <img src="cid:logo" alt="ACS Viitorul Răchiteni" height="80" style="display:block;border:0;outline:none;margin:auto;">
                              <div style="height:10px"></div>
                              <div style="font-size:18px;font-weight:800;color:#fff;letter-spacing:.3px">%s</div>
                              <div style="font-size:12px;color:#e5e7eb;opacity:.9;">Ai primit un mesaj de pe site.</div>
                            </td>
                          </tr>

                          <tr><td style="height:18px"></td></tr>

                          <!-- Conținut trimis -->
                          <tr>
                            <td style="padding:0 28px">
                              <div style="padding:14px 16px;border:1px solid #e5e7eb;border-radius:10px;background:#f9fafb;color:#111827;">
                                %s
                              </div>
                            </td>
                          </tr>

                          <tr><td style="height:22px"></td></tr>

                          <!-- Footer -->
                          <tr>
                            <td style="padding:0 28px 26px 28px;font-size:12px;color:#9ca3af;">
                              Trimis pe %s · Echipa <strong>ACS Viitorul Răchiteni</strong>
                            </td>
                          </tr>

                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(
                    escapeHtml(subject),
                    escapeHtml(subject),
                    innerHtml,
                    now
            );

            // Fallback text
            final String textFallback = !isBlank(event.getText())
                    ? event.getText()
                    : stripHtml(innerHtml) + "\n\nTrimis pe " + now;

            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");

            // „Friendly From” (pe domeniul tău) + opțional „Sender” pe MimeMessage
            if (!isBlank(fromAddress)) {
                InternetAddress from = new InternetAddress(
                        fromAddress,
                        "Formular contact – ACS Viitorul Răchiteni",
                        StandardCharsets.UTF_8.name()
                );
                helper.setFrom(from);
                try {
                    // dacă vrei și headerul "Sender":
                    mime.setSender(from);
                } catch (Exception ignore) {
                    // nu e obligatoriu; unele servere îl ignoră
                }
            }

            // Reply-To către adresa din formular
            if (!isBlank(event.getFrom())) {
                helper.setReplyTo(event.getFrom());
            }

            List<String> toList = event.getTo();
            helper.setTo(toList.toArray(new String[0]));
            helper.setSubject(subject);

            helper.setText(textFallback, html);

            // logo inline (src/main/resources/mail/logo.png)
            helper.addInline("logo", new ClassPathResource("mail/logo.png"), "image/png");

            mailSender.send(mime);
            log.info("Email Contact trimis către {} (subiect: {})", toList, subject);

        } catch (Exception e) {
            log.error("Eroare la trimiterea emailului de contact: {}", e.getMessage(), e);
        }
    }

    /* ===== Helpers ===== */
    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private static String nvl(String s) {
        return s == null ? "" : s;
    }

    private static String escapeHtml(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private static String stripHtml(String html) {
        if (html == null) return "";
        return html
                .replaceAll("(?is)<br\\s*/?>", "\n")
                .replaceAll("(?is)<[^>]+>", "")
                .trim();
    }
}
