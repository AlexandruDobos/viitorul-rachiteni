// src/main/java/com/viitorul/app/web/SharePreviewController.java
package com.viitorul.app.web;

import com.viitorul.app.entity.Announcement;
import com.viitorul.app.repository.AnnouncementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/share")
public class SharePreviewController {

    private final AnnouncementRepository announcementRepository;

    /** Domeniul public (frontend) pe care vrei ca utilizatorii să ajungă. */
    private static final String FRONTEND_ORIGIN = "https://www.viitorulrachiteni.ro";

    @GetMapping(value = "/stiri/{id}", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> shareStireNoSlug(@PathVariable Long id) {
        return buildShareStire(id);
    }

    @GetMapping(value = "/stiri/{id}/{slug}", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> shareStireWithSlug(@PathVariable Long id, @PathVariable String slug) {
        return buildShareStire(id);
    }

    private ResponseEntity<String> buildShareStire(Long id) {
        Optional<Announcement> opt = announcementRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .header(HttpHeaders.CACHE_CONTROL, "no-store, no-cache, must-revalidate, max-age=0")
                    .header(HttpHeaders.CONTENT_TYPE, "text/html; charset=UTF-8")
                    .body("""
                          <!doctype html>
                          <html lang="ro"><head>
                            <meta charset="utf-8">
                            <title>404</title>
                            <meta name="robots" content="noindex">
                          </head><body>404</body></html>
                          """);
        }

        Announcement a = opt.get();

        String slug   = slugify(a.getTitle());
        String url    = FRONTEND_ORIGIN + "/stiri/" + a.getId() + "/" + slug;

        // Imagine OG (prefer CDNs absolute); dacă e relativă, prefixeaz-o cu frontend
        String cover = (a.getCoverUrl() != null && !a.getCoverUrl().isBlank())
                ? a.getCoverUrl().trim()
                : FRONTEND_ORIGIN + "/og-default.jpg";
        if (!cover.startsWith("http://") && !cover.startsWith("https://")) {
            cover = FRONTEND_ORIGIN + (cover.startsWith("/") ? cover : "/" + cover);
        }

        String title = esc(a.getTitle());
        String desc  = esc(excerpt(
                (a.getContentText() != null && !a.getContentText().isBlank()) ? a.getContentText() : a.getTitle(),
                180
        ));

        String html = """
                <!doctype html>
                <html lang="ro"><head>
                  <meta charset="utf-8">
                  <title>%1$s</title>
                  <meta name="robots" content="index,follow">
                  <link rel="canonical" href="%2$s">

                  <!-- Open Graph -->
                  <meta property="og:type" content="article">
                  <meta property="og:site_name" content="ACS Viitorul Răchiteni">
                  <meta property="og:locale" content="ro_RO">
                  <meta property="og:title" content="%1$s">
                  <meta property="og:description" content="%3$s">
                  <meta property="og:url" content="%2$s">
                  <meta property="og:image" content="%4$s">
                  <meta property="og:image:secure_url" content="%4$s">

                  <!-- Twitter -->
                  <meta name="twitter:card" content="summary_large_image">
                  <meta name="twitter:title" content="%1$s">
                  <meta name="twitter:description" content="%3$s">
                  <meta name="twitter:image" content="%4$s">

                  <!-- Redirect utilizatori către pagina publică -->
                  <meta http-equiv="refresh" content="0;url=%2$s">
                </head>
                <body>
                  <p>Redirecționare către <a href="%2$s">%1$s</a>…</p>
                </body></html>
                """.formatted(title, url, desc, cover);

        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "no-store, no-cache, must-revalidate, max-age=0")
                .header(HttpHeaders.CONTENT_TYPE, "text/html; charset=UTF-8")
                .body(html);
    }

    /* -------- helpers -------- */

    private static String esc(String s) {
        return s == null ? "" :
                s.replace("&","&amp;")
                        .replace("<","&lt;")
                        .replace(">","&gt;")
                        .replace("\"","&quot;");
    }

    private static String excerpt(String s, int n) {
        s = (s == null ? "" : s).trim().replaceAll("\\s+"," ");
        return s.length() <= n ? s : s.substring(0, n - 1) + "…";
    }

    private static String slugify(String s) {
        if (s == null) return "";
        String n = java.text.Normalizer.normalize(s.toLowerCase(), java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+","");
        return n.replaceAll("[^a-z0-9]+","-").replaceAll("(^-|-$)","");
    }
}
