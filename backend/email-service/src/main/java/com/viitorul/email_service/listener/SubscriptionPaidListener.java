// email-service: src/main/java/com/viitorul/email_service/listener/SubscriptionPaidListener.java
package com.viitorul.email_service.listener;

import com.viitorul.common.events.SubscriptionPaymentCompletedEvent;
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
public class SubscriptionPaidListener {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:}") private String from;
    @Value("${app.subscriptions.thankyou.title:Mulțumim pentru abonamentul lunar!}")
    private String subject;
    @Value("${app.donations.team-name:ACS Viitorul Răchiteni}") private String teamName;
    @Value("${app.website-url:https://www.viitorulrachiteni.ro}") private String websiteUrl;

    // Ascultă evenimentul tău comun: SubscriptionPaymentCompletedEvent
    @RabbitListener(queues = "subscription.paid.queue")
    public void handle(SubscriptionPaymentCompletedEvent ev) {
        try {
            if (ev.getSupporterEmail() == null || ev.getSupporterEmail().isBlank()) return;

            String name = (ev.getSupporterName() == null || ev.getSupporterName().isBlank())
                    ? "prieten al echipei"
                    : ev.getSupporterName();

            String amountStr = formatAmount(ev.getAmount(), ev.getCurrency());
            String msgBlock = (ev.getMessage() != null && !ev.getMessage().isBlank())
                    ? """
                       <tr><td style="height:12px"></td></tr>
                       <tr>
                         <td style="padding:0 32px;font-size:14px;color:#374151;">
                           <em>Mesajul tău:</em><br>
                           <span style="display:inline-block;margin-top:6px;padding:10px 12px;border-radius:10px;background:#f3f4f6;color:#111827;">
                             %s
                           </span>
                         </td>
                       </tr>
                       """.formatted(safe(ev.getMessage()))
                    : "";

            String html = """
        <!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
        <title>%1$s</title></head>
        <body style="margin:0;padding:0;background:#f6f8fb;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;line-height:1.6;color:#222;">
          <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
            <tr><td align="center">
              <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:14px;box-shadow:0 2px 12px rgba(16,24,40,.08);overflow:hidden;">
                <tr>
                  <td align="center" style="background-image:linear-gradient(90deg,#1e3a8a,#2563eb,#0ea5e9);padding:36px 24px;">
                    <img src="cid:logo" alt="%2$s" height="96" style="display:block;border:0;outline:none;">
                  </td>
                </tr>
                <tr><td style="height:12px"></td></tr>
                <tr><td align="center" style="padding:0 32px">
                  <h1 style="margin:0;font-size:24px;line-height:1.3;color:#1f2937;font-weight:800;">%1$s</h1>
                </td></tr>
                <tr><td style="height:18px"></td></tr>
                <tr><td style="padding:0 32px;font-size:15px;color:#374151;">
                  Salut %7$s,
                  <br><br>
                  Abonamentul tău lunar pentru <strong>%2$s</strong> a fost procesat cu succes.
                  <br>Îți mulțumim pentru contribuția de <strong>%3$s</strong> – datorită ție putem susține echipa, copiii și proiectele comunității.
                </td></tr>
                %8$s
                <tr><td style="height:18px"></td></tr>
                <tr><td align="center" style="padding: 0 32px 24px">
                  <a href="%4$s" style="display:inline-block;padding:14px 24px;border-radius:12px;background:#111827;color:#fff;text-decoration:none;font-weight:800;font-size:15px;box-shadow:0 6px 16px rgba(17,24,39,.15);">
                    Vezi noutățile echipei
                  </a>
                </td></tr>
                <tr><td style="padding:0 32px 28px;font-size:12px;color:#6b7280;">
                  Factură: <code style="color:#374151">%5$s</code> &nbsp; | &nbsp; Abonament: <code style="color:#374151">%6$s</code>
                </td></tr>
                <tr><td style="padding:0 32px 30px;font-size:12px;color:#9ca3af;">
                  Cu recunoștință,<br> Echipa <strong>%2$s</strong>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body></html>
      """.formatted(
                    subject,                        // %1$s
                    teamName,                       // %2$s
                    amountStr,                      // %3$s
                    websiteUrl,                     // %4$s
                    safe(ev.getStripeInvoiceId()),  // %5$s
                    safe(ev.getStripeSubscriptionId()), // %6$s
                    safe(name),                     // %7$s
                    msgBlock                        // %8$s (opțional)
            );

            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper h = new MimeMessageHelper(mime, true, "UTF-8");
            h.setTo(ev.getSupporterEmail());
            if (!from.isBlank()) h.setFrom(from);
            h.setSubject(subject);
            h.setText(html, true);
            h.addInline("logo", new ClassPathResource("mail/logo.png"), "image/png");
            mailSender.send(mime);
        } catch (Exception ex) {
            log.error("Email abonament eșuat: {}", ex.getMessage(), ex);
        }
    }

    private static String safe(String s){ return (s == null) ? "" : s; }

    private static String formatAmount(@Nullable Long minor, @Nullable String currency) {
        if (minor == null) return "";
        double val = minor / 100.0;
        String cur = currency == null ? "" : currency.toUpperCase(Locale.ROOT);
        return String.format(Locale.US, "%.2f %s", val, cur);
    }
}
