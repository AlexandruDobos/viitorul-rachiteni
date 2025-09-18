// src/main/java/com/viitorul/app/web/SitemapController.java
package com.viitorul.app.web;

import com.viitorul.app.entity.Announcement;
import com.viitorul.app.entity.Player;
import com.viitorul.app.entity.Match;
import com.viitorul.app.repository.AnnouncementRepository;
import com.viitorul.app.repository.PlayerRepository;
import com.viitorul.app.repository.MatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/app")
public class SitemapController {

    private final AnnouncementRepository announcementRepository;
    private final PlayerRepository playerRepository;
    private final MatchRepository matchRepository;

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> sitemap(HttpServletRequest req) {
        final String origin = getOrigin(req);

        List<String> entries = new ArrayList<>();

        // Pagini statice
        add(entries, origin + "/", null, "daily", "0.9");
        add(entries, origin + "/stiri", null, "daily", "0.8");
        add(entries, origin + "/squad", null, "weekly", "0.6");
        add(entries, origin + "/matches", null, "hourly", "0.7");
        add(entries, origin + "/results", null, "daily", "0.7");
        add(entries, origin + "/standings", null, "daily", "0.7");
        add(entries, origin + "/donations", null, "yearly", "0.3");
        add(entries, origin + "/contact", null, "yearly", "0.3");
        add(entries, origin + "/confidentialitate", null, "yearly", "0.1");
        add(entries, origin + "/termeni", null, "yearly", "0.1");
        add(entries, origin + "/cookie-uri", null, "yearly", "0.1");

        // Știri
        for (Announcement a : announcementRepository.findAll()) {
            String slug = slugify(a.getTitle());
            String url = origin + "/stiri/" + a.getId() + "/" + slug;
            String lastmod = a.getPublishedAt() != null
                    ? a.getPublishedAt().format(DateTimeFormatter.ISO_DATE)
                    : null;
            add(entries, url, lastmod, "weekly", "0.6");
        }

        // Jucători activi
        for (Player p : playerRepository.findAllByIsActiveTrueOrderByNameAsc()) {
            String slug = slugify(p.getName());
            String url = origin + "/players/" + p.getId() + (slug.isBlank() ? "" : "/" + slug);
            add(entries, url, null, "weekly", "0.5");
        }

        // Meciuri (upcoming + finished)
        Set<Long> seen = new HashSet<>();
        for (Match m : matchRepository.findUpcomingMatches()) {
            add(entries, origin + "/matches/" + m.getId(), lastmod(m.getDate()), "hourly", "0.6");
            seen.add(m.getId());
        }
        for (Match m : matchRepository.findFinishedMatchesDesc()) {
            if (seen.add(m.getId())) {
                add(entries, origin + "/matches/" + m.getId(), lastmod(m.getDate()), "monthly", "0.5");
            }
        }

        StringBuilder xml = new StringBuilder();
        xml.append("""
                <?xml version="1.0" encoding="UTF-8"?>
                <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                """);
        for (String e : entries) xml.append(e);
        xml.append("</urlset>");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/xml; charset=UTF-8")
                .body(xml.toString());
    }

    // ===== helpers =====

    private static void add(List<String> list, String loc, String lastmod, String freq, String pri) {
        StringBuilder sb = new StringBuilder();
        sb.append("<url>");
        sb.append("<loc>").append(escape(loc)).append("</loc>");
        if (lastmod != null) sb.append("<lastmod>").append(lastmod).append("</lastmod>");
        if (freq != null) sb.append("<changefreq>").append(freq).append("</changefreq>");
        if (pri != null) sb.append("<priority>").append(pri).append("</priority>");
        sb.append("</url>");
        list.add(sb.toString());
    }

    private static String lastmod(LocalDate d) {
        return d == null ? null : d.format(DateTimeFormatter.ISO_DATE);
    }

    private static String escape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

    private static String slugify(String s) {
        if (s == null) return "";
        String nfd = java.text.Normalizer.normalize(s.toLowerCase(), java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return nfd.replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
    }

    /** Respectă reverse proxy / Cloudflare pentru https + host corect */
    private static String getOrigin(HttpServletRequest req) {
        String proto = Optional.ofNullable(req.getHeader("X-Forwarded-Proto")).orElse(req.getScheme());
        String host = Optional.ofNullable(req.getHeader("X-Forwarded-Host")).orElse(req.getServerName());
        String port = Optional.ofNullable(req.getHeader("X-Forwarded-Port")).orElse("");

        // dacă host deja are port, păstrează-l
        if (host.contains(":")) return proto + "://" + host;

        // dacă nu avem port sau e standard, nu-l include
        if (port.isBlank()
                || ("http".equalsIgnoreCase(proto) && "80".equals(port))
                || ("https".equalsIgnoreCase(proto) && "443".equals(port))) {
            return proto + "://" + host;
        }
        return proto + "://" + host + ":" + port;
    }
}
