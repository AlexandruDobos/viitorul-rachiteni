package com.viitorul.email_service.listener;

import com.viitorul.common.events.DonationCompletedEvent;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.lang.Nullable;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Slf4j
@Component
@RequiredArgsConstructor
public class DonationCompletedListener {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:}")
    private String from;

    @Value("${app.donations.thankyou.title:Mulțumim pentru donație!}")
    private String subject;

    @Value("${app.donations.team-name:ACS Viitorul Răchiteni}")
    private String teamName;

    // butonul din email (opțional). Dacă vrei să nu apară, lasă gol.
    @Value("${app.website-url:https://www.viitorulrachiteni.ro}")
    private String websiteUrl;

    @RabbitListener(queues = "donation.completed.queue")
    public void handleDonation(DonationCompletedEvent event) {
        try {
            if (event.getDonorEmail() == null || event.getDonorEmail().isBlank()) {
                log.warn("Donație fără email, nu trimit mesaj. sessionId={}", event.getSessionId());
                return;
            }

            // date pentru email
            String donor = (event.getDonorName() != null && !event.getDonorName().isBlank())
                    ? event.getDonorName()
                    : "prieten al echipei";
            String amountStr = formatAmount(event.getAmount(), event.getCurrency());
            String safeMsg = (event.getMessage() != null && !event.getMessage().isBlank())
                    ? escapeHtml(event.getMessage())
                    : null;

            // bloc opțional pentru „Mesajul tău”
            String extraMsgBlock = (safeMsg != null)
                    ? """
                      <!-- Mesajul donatorului -->
                      <tr><td style="height:18px"></td></tr>
                      <tr>
                        <td style="padding:0 32px;font-size:14px;color:#374151;">
                          <em>Mesajul tău:</em><br>
                          <span style="display:inline-block;margin-top:6px;padding:10px 12px;border-radius:10px;background:#f3f4f6;color:#111827;">
                            %s
                          </span>
                        </td>
                      </tr>
                      """.formatted(safeMsg)
                    : "";

            // butonul mare (păstrăm structura identică cu „confirm”)
            String ctaBlock = (websiteUrl != null && !websiteUrl.isBlank())
                    ? """
                      <!-- Buton (identic ca stil) -->
                      <tr>
                        <td align="center" style="padding: 28px 32px 28px 32px">
                          <a href="%s"
                             style="display:inline-block;padding:16px 28px;border-radius:12px;
                                    background:#111827;color:#ffffff;text-decoration:none;
                                    font-weight:800;font-size:15px;box-shadow:0 6px 16px rgba(17,24,39,.15);">
                            Vezi noutățile echipei
                          </a>
                        </td>
                      </tr>
                      """.formatted(websiteUrl)
                    : "";

            // HTML cu același design/layout ca „Confirmă-ți contul” (gradient albastru, logo mare)
            String html = """
                <!doctype html>
                <html lang="ro">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <title>%1$s</title>
                </head>
                <body style="margin:0;padding:0;background:#f6f8fb;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;line-height:1.6;color:#222;">
                  <!-- preheader (ascuns) -->
                  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
                    %1$s la %2$s
                  </div>

                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
                    <tr>
                      <td align="center">
                        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;box-shadow:0 2px 12px rgba(16,24,40,.08);overflow:hidden;">

                          <!-- Header cu logo (identic stil) -->
                          <tr>
                            <td align="center" style="background:#0b61ff;background-image:linear-gradient(90deg,#1e3a8a,#2563eb,#0ea5e9);padding:36px 24px;">
                              <img src="cid:logo" alt="%2$s" height="96" style="display:block;border:0;outline:none;">
                            </td>
                          </tr>

                          <!-- Spacer -->
                          <tr><td style="height:12px"></td></tr>

                          <!-- Titlu -->
                          <tr>
                            <td align="center" style="padding:0 32px">
                              <h1 style="margin:0;font-size:24px;line-height:1.3;color:#1f2937;font-weight:800;">
                                %1$s
                              </h1>
                            </td>
                          </tr>

                          <!-- Intro -->
                          <tr><td style="height:18px"></td></tr>
                          <tr>
                            <td style="padding:0 32px;font-size:15px;color:#374151;">
                              Salut %3$s,
                              <br><br>
                              Îți mulțumim pentru donația de <strong>%4$s</strong>. Contribuția ta ne ajută
                              să susținem copiii și proiectele echipei <strong>%2$s</strong>. ❤️
                            </td>
                          </tr>

                          <!-- Spațiu înainte de buton -->
                          <tr><td style="height:18px"></td></tr>

                          %5$s

                          %6$s

                          <!-- Detalii tranzacție -->
                          <tr><td style="height:18px"></td></tr>
                          <tr>
                            <td style="padding:0 32px;font-size:12px;color:#6b7280;">
                              ID sesiune: <code style="color:#374151">%7$s</code>
                            </td>
                          </tr>

                          <!-- Footer -->
                          <tr><td style="height:26px"></td></tr>
                          <tr>
                            <td style="padding:0 32px 30px 32px;font-size:12px;color:#9ca3af;">
                              Mulțumim pentru sprijinul acordat!
                              <br>
                              Echipa <strong>%2$s</strong>
                            </td>
                          </tr>

                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(
                    subject,              // %1$s
                    teamName,             // %2$s
                    escapeHtml(donor),    // %3$s
                    amountStr,            // %4$s
                    extraMsgBlock,        // %5$s (opțional)
                    ctaBlock,             // %6$s (opțional)
                    escapeHtml(event.getSessionId()) // %7$s
            );

            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");

            helper.setTo(event.getDonorEmail());
            helper.setSubject(subject);
            if (!from.isBlank()) helper.setFrom(from);
            helper.setText(html, true);

            // logo inline (pune fișierul la: email-service/src/main/resources/mail/logo.png)
            helper.addInline("logo", new ClassPathResource("mail/logo.png"), "image/png");

            mailSender.send(mime);
            log.info("Email donație trimis către {} ({} {})", event.getDonorEmail(), amountStr, event.getCurrency());
        } catch (Exception e) {
            log.error("Eroare la trimiterea emailului pentru donator {}: {}", event.getDonorEmail(), e.getMessage(), e);
        }
    }

    private static String formatAmount(@Nullable Long minor, @Nullable String currency) {
        if (minor == null) return "";
        double val = minor / 100.0;
        String cur = currency == null ? "" : currency.toUpperCase(Locale.ROOT);
        return String.format(Locale.US, "%.2f %s", val, cur);
    }

    // protecție minimă pentru injectare în HTML
    private static String escapeHtml(String s) {
        return s == null ? "" : s.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;");
    }
}
