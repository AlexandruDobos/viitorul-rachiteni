// src/main/java/com/viitorul/app/web/SitemapController.java
package com.viitorul.app.web;

import com.viitorul.app.entity.Announcement;
import com.viitorul.app.entity.Player;
import com.viitorul.app.entity.Match;
import com.viitorul.app.repository.AnnouncementRepository;
import com.viitorul.app.repository.PlayerRepository;
import com.viitorul.app.repository.MatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/app")
public class SitemapController {

    private final AnnouncementRepository announcementRepository;
    private final PlayerRepository playerRepository;
    private final MatchRepository matchRepository;

    /** URL-ul public canonic (nu cel de API). Configurable prin app.public-base-url */
    @Value("${app.public-base-url:https://www.viitorulrachiteni.ro}")
    private String publicBaseUrl;

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> sitemap(HttpServletRequest req) {
        // Folosim mereu origin-ul public (www), nu host-ul cererii (care poate fi api.)
        final String origin = canonicalOrigin();

        List<String> entries = new ArrayList<>();

        // Pagini statice
        add(entries, origin + "/",                  null, "daily",  "0.9");
        add(entries, origin + "/stiri",             null, "daily",  "0.8");
        add(entries, origin + "/squad",             null, "weekly", "0.6");
        add(entries, origin + "/matches",           null, "hourly", "0.7");
        add(entries, origin + "/results",           null, "daily",  "0.7");
        add(entries, origin + "/standings",         null, "daily",  "0.7");
        add(entries, origin + "/donations",         null, "yearly", "0.3");
        add(entries, origin + "/contact",           null, "yearly", "0.3");
        add(entries, origin + "/confidentialitate", null, "yearly", "0.1");
        add(entries, origin + "/termeni",           null, "yearly", "0.1");
        add(entries, origin + "/cookie-uri",        null, "yearly", "0.1");

        // Știri
        for (Announcement a : announcementRepository.findAll()) {
            String slug = slugify(a.getTitle());
            String url = origin + "/stiri/" + a.getId() + "/" + slug;
            String lastmod = lastmodClamp(a.getPublishedAt() != null ? a.getPublishedAt().toLocalDate() : null);
            add(entries, url, lastmod, "weekly", "0.6");
        }

        // Jucători activi
        for (Player p : playerRepository.findAllByIsActiveTrueOrderByNameAsc()) {
            String slug = slugify(p.getName());
            String url = origin + "/players/" + p.getId() + (slug.isBlank() ? "" : "/" + slug);
            add(entries, url, null, "weekly", "0.5");
        }

        // Meciuri
        Set<Long> seen = new HashSet<>();
        for (Match m : matchRepository.findUpcomingMatches()) {
            add(entries, origin + "/matches/" + m.getId(), null, "hourly", "0.6");
            seen.add(m.getId());
        }
        Page<Match> firstPage = matchRepository.searchFinishedMatches(null, null, PageRequest.of(0, 5000));
        for (Match m : firstPage.getContent()) {
            if (seen.add(m.getId())) {
                add(entries, origin + "/matches/" + m.getId(), lastmodClamp(m.getDate()), "monthly", "0.5");
            }
        }

        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");
        for (String e : entries) xml.append(e);
        xml.append("</urlset>\n");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/xml; charset=UTF-8")
                .body(xml.toString());
    }

    private String canonicalOrigin() {
        // Te asiguri că nu are slash la final
        return publicBaseUrl.endsWith("/") ? publicBaseUrl.substring(0, publicBaseUrl.length() - 1) : publicBaseUrl;
    }

    private static void add(List<String> list, String loc, String lastmod, String freq, String pri) {
        StringBuilder sb = new StringBuilder();
        sb.append("  <url>");
        sb.append("<loc>").append(escape(loc)).append("</loc>");
        if (lastmod != null) sb.append("<lastmod>").append(lastmod).append("</lastmod>");
        if (freq != null) sb.append("<changefreq>").append(freq).append("</changefreq>");
        if (pri != null) sb.append("<priority>").append(pri).append("</priority>");
        sb.append("</url>\n");
        list.add(sb.toString());
    }

    private static String lastmodClamp(LocalDate d) {
        if (d == null) return null;
        LocalDate today = LocalDate.now();
        LocalDate safe = d.isAfter(today) ? today : d;
        return safe.format(DateTimeFormatter.ISO_DATE);
    }

    private static String lastmodClamp(LocalDateTime dt) {
        if (dt == null) return null;
        return lastmodClamp(dt.toLocalDate());
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
}
