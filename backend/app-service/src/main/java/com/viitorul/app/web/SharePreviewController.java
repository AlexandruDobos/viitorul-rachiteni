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

    @GetMapping(value = "/stiri/{id}", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> shareStire(
            @PathVariable Long id,
            HttpServletRequest req
    ) {
        Optional<Announcement> opt = announcementRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("<!doctype html><meta charset='utf-8'><title>404</title><meta name='robots' content='noindex'>");
        }

        Announcement a = opt.get();
        String origin = getOrigin(req); // la fel ca în SitemapController
        String slug   = slugify(a.getTitle());
        String url    = origin + "/stiri/" + a.getId() + "/" + slug;

        String img = a.getCoverUrl() != null && !a.getCoverUrl().isBlank()
                ? a.getCoverUrl()
                : origin + "/og-default.jpg"; // pune o imagine fallback în frontend/static

        String title = esc(a.getTitle());
        String desc  = esc(excerpt(a.getContentText() != null ? a.getContentText() : a.getTitle(), 180));

        String html = """
        <!doctype html>
        <html lang="ro"><head>
          <meta charset="utf-8">
          <title>%s</title>
          <meta name="robots" content="index,follow">
          <link rel="canonical" href="%s">

          <meta property="og:type" content="article">
          <meta property="og:site_name" content="ACS Viitorul Răchiteni">
          <meta property="og:title" content="%s">
          <meta property="og:description" content="%s">
          <meta property="og:url" content="%s">
          <meta property="og:image" content="%s">

          <meta name="twitter:card" content="summary_large_image">
          <meta name="twitter:title" content="%s">
          <meta name="twitter:description" content="%s">
          <meta name="twitter:image" content="%s">

          <meta http-equiv="refresh" content="0;url=%s">
        </head>
        <body>
          <p>Redirecționare către <a href="%s">%s</a>…</p>
        </body></nhtml>
        """.formatted(title, url, title, desc, url, img, title, desc, img, url, url, title);

        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "no-store, no-cache, must-revalidate, max-age=0")
                .body(html);
    }

    /* helpers */
    private static String esc(String s) { return s == null ? "" : s.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;").replace("\"","&quot;"); }
    private static String excerpt(String s, int n) { s = s == null ? "" : s.trim().replaceAll("\\s+"," "); return s.length()<=n? s : s.substring(0,n-1) + "…"; }
    private static String slugify(String s){ if(s==null)return ""; String n=java.text.Normalizer.normalize(s.toLowerCase(), java.text.Normalizer.Form.NFD).replaceAll("\\p{InCombiningDiacriticalMarks}+",""); return n.replaceAll("[^a-z0-9]+","-").replaceAll("(^-|-$)",""); }
    private static String getOrigin(HttpServletRequest req){
        String proto = Optional.ofNullable(req.getHeader("X-Forwarded-Proto")).orElse(req.getScheme());
        String host  = Optional.ofNullable(req.getHeader("X-Forwarded-Host")).orElse(req.getServerName());
        String port  = Optional.ofNullable(req.getHeader("X-Forwarded-Port")).orElse("");
        if (host.contains(":")) return proto + "://" + host;
        if (port.isBlank() || ("http".equalsIgnoreCase(proto) && "80".equals(port))
                || ("https".equalsIgnoreCase(proto) && "443".equals(port))) {
            return proto + "://" + host;
        }
        return proto + "://" + host + ":" + port;
    }
}
