package com.viitorul.app.web;

import com.viitorul.app.dto.MatchDTO;
import com.viitorul.app.entity.Announcement;
import com.viitorul.app.entity.Player;
import com.viitorul.app.entity.Match;
import com.viitorul.app.repository.AnnouncementRepository;
import com.viitorul.app.repository.PlayerRepository;
import com.viitorul.app.repository.MatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@RequiredArgsConstructor
public class SharePreviewFilter extends OncePerRequestFilter {

    private final AnnouncementRepository announcementRepository;
    private final PlayerRepository playerRepository;
    private final MatchRepository matchRepository;

    private static final Pattern BOT_UA = Pattern.compile(
            "(facebookexternalhit|facebot|Twitterbot|LinkedInBot|Slackbot|WhatsApp|Discordbot|TelegramBot|Embedly|Pinterest|vkShare)",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern NEWS_PATH   = Pattern.compile("^/stiri/(\\d+)(?:/.*)?$");
    private static final Pattern PLAYER_PATH = Pattern.compile("^/players/(\\d+)(?:/.*)?$");
    private static final Pattern MATCH_PATH  = Pattern.compile("^/matches/(\\d+)(?:/.*)?$");

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {

        final String ua = Optional.ofNullable(req.getHeader("User-Agent")).orElse("");
        if (!BOT_UA.matcher(ua).find()) {
            chain.doFilter(req, res);
            return;
        }

        final String path = req.getRequestURI();
        final String origin = req.getScheme() + "://" + req.getServerName()
                + ((req.getServerPort() == 80 || req.getServerPort() == 443) ? "" : ":" + req.getServerPort());

        // ====== ȘTIRE ======
        Matcher mNews = NEWS_PATH.matcher(path);
        if (mNews.matches()) {
            Long id = Long.valueOf(mNews.group(1));
            Optional<Announcement> opt = announcementRepository.findById(id);
            if (opt.isPresent()) {
                Announcement a = opt.get();
                String title = escape(a.getTitle());
                String desc = escape(Optional.ofNullable(a.getContentText()).orElse(""))
                        .replaceAll("\\s+", " ")
                        .trim();
                if (desc.length() > 200) desc = desc.substring(0, 200) + "…";

                String cover = a.getCoverUrl() != null && !a.getCoverUrl().isBlank()
                        ? abs(origin, a.getCoverUrl())
                        : origin + "/favicon.png";
                String url = origin + "/stiri/" + a.getId() + "/" + slugify(a.getTitle());

                String published = a.getPublishedAt() != null
                        ? a.getPublishedAt().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME)
                        : "";

                String html = """
                        <!doctype html>
                        <html lang="ro"><head>
                        <meta charset="utf-8"/>
                        <title>%s</title>
                        <link rel="canonical" href="%s"/>
                        <meta name="description" content="%s"/>

                        <meta property="og:site_name" content="ACS Viitorul Răchiteni"/>
                        <meta property="og:type" content="article"/>
                        <meta property="og:title" content="%s"/>
                        <meta property="og:description" content="%s"/>
                        <meta property="og:url" content="%s"/>
                        <meta property="og:image" content="%s"/>

                        <meta name="twitter:card" content="summary_large_image"/>
                        <meta name="twitter:title" content="%s"/>
                        <meta name="twitter:description" content="%s"/>
                        <meta name="twitter:image" content="%s"/>

                        <script type="application/ld+json">
                        {
                          "@context":"https://schema.org",
                          "@type":"Article",
                          "headline":"%s",
                          "datePublished":"%s",
                          "image":["%s"],
                          "mainEntityOfPage":{"@type":"WebPage","@id":"%s"}
                        }
                        </script>
                        </head><body>Preview...</body></html>
                        """.formatted(
                        title, url, desc,
                        title, desc, url, cover,
                        title, desc, cover,
                        title, published, cover, url
                );

                res.setStatus(200);
                res.setContentType("text/html; charset=UTF-8");
                res.getWriter().write(html);
                return;
            }
        }

        // ====== PLAYER ======
        Matcher mPlayer = PLAYER_PATH.matcher(path);
        if (mPlayer.matches()) {
            Long pid = Long.valueOf(mPlayer.group(1));
            String url = origin + path;

            String title = "Profil jucător – ACS Viitorul Răchiteni";
            String desc = "Profil jucător ACS Viitorul Răchiteni.";
            String image = origin + "/favicon.png";

            Optional<Player> opt = playerRepository.findById(pid);
            if (opt.isPresent()) {
                Player p = opt.get();
                String name = Optional.ofNullable(p.getName()).orElse("Jucător");
                title = escape(name + " – Profil jucător – ACS Viitorul Răchiteni");
                String post = Optional.ofNullable(p.getPosition()).orElse("Jucător");
                String nr = p.getShirtNumber() != null ? " • #" + p.getShirtNumber() : "";
                desc = escape(post + nr);
                if (p.getProfileImageUrl() != null && !p.getProfileImageUrl().isBlank()) {
                    image = abs(origin, p.getProfileImageUrl());
                }
                url = origin + "/players/" + p.getId() + "/" + slugify(name);
            }

            String html = baseStaticHtml(title, desc, url, image, "profile");
            res.setStatus(200);
            res.setContentType("text/html; charset=UTF-8");
            res.getWriter().write(html);
            return;
        }

        // ====== MATCH ======
        Matcher mMatch = MATCH_PATH.matcher(path);
        if (mMatch.matches()) {
            Long mid = Long.valueOf(mMatch.group(1));
            String url = origin + path;

            String title = "Detalii meci – ACS Viitorul Răchiteni";
            String desc = "Program și detalii meci pentru ACS Viitorul Răchiteni.";
            String image = origin + "/favicon.png";

            Optional<Match> opt = matchRepository.findById(mid);
            if (opt.isPresent()) {
                Match m = opt.get();
                MatchDTO matchDTO = MatchDTO.toDto(m);
                String h = Optional.ofNullable(matchDTO.getHomeTeamName()).orElse("Echipa gazdă");
                String a = Optional.ofNullable(matchDTO.getAwayTeamName()).orElse("Echipa oaspete");
                String score = (m.getHomeGoals() != null && m.getAwayGoals() != null)
                        ? " · Scor: " + m.getHomeGoals() + "-" + m.getAwayGoals() : "";
                title = escape(h + " vs " + a + " – Detalii meci");
                desc = escape(dateStr(m.getDate()) + timeStr(m.getKickoffTime()) + locStr(m.getLocation()) + score);

                String pick = (matchDTO.getHomeTeamLogo() != null && !matchDTO.getHomeTeamLogo().isBlank())
                        ? matchDTO.getHomeTeamLogo()
                        : matchDTO.getAwayTeamLogo();
                if (pick != null && !pick.isBlank()) {
                    image = abs(origin, pick);
                }
            }

            String html = """
                <!doctype html>
                <html lang="ro"><head>
                <meta charset="utf-8"/>
                <title>%s</title>
                <link rel="canonical" href="%s"/>
                <meta name="description" content="%s"/>

                <meta property="og:site_name" content="ACS Viitorul Răchiteni"/>
                <meta property="og:type" content="website"/>
                <meta property="og:title" content="%s"/>
                <meta property="og:description" content="%s"/>
                <meta property="og:url" content="%s"/>
                <meta property="og:image" content="%s"/>

                <meta name="twitter:card" content="summary_large_image"/>
                <meta name="twitter:title" content="%s"/>
                <meta name="twitter:description" content="%s"/>
                <meta name="twitter:image" content="%s"/>

                <script type="application/ld+json">
                {
                  "@context":"https://schema.org",
                  "@type":"SportsEvent",
                  "name":"%s",
                  "startDate":"%s",
                  "location":{"@type":"Place","name":"%s"}
                }
                </script>
                </head><body>Preview...</body></html>
            """.formatted(
                    title, url, desc,
                    title, desc, url, image,
                    title, desc, image,
                    title,
                    isoDateTime(opt.map(Match::getDate).orElse(null), opt.map(Match::getKickoffTime).orElse(null)),
                    escape(opt.map(Match::getLocation).orElse(""))
            );

            res.setStatus(200);
            res.setContentType("text/html; charset=UTF-8");
            res.getWriter().write(html);
            return;
        }

        // ====== STATIC PAGES (donations/contact) ======
        if (path.equals("/donations")) {
            String url = origin + "/donations";
            String html = baseStaticHtml(
                    "Donează – ACS Viitorul Răchiteni",
                    "Susține ACS Viitorul Răchiteni printr-o donație. Orice ajutor contează!",
                    url, origin + "/favicon.png", "website");
            res.setStatus(200); res.setContentType("text/html; charset=UTF-8"); res.getWriter().write(html); return;
        }
        if (path.equals("/contact")) {
            String url = origin + "/contact";
            String html = baseStaticHtml(
                    "Contact – ACS Viitorul Răchiteni",
                    "Contactează ACS Viitorul Răchiteni pentru parteneriate, presă și alte informații.",
                    url, origin + "/favicon.png", "website");
            res.setStatus(200); res.setContentType("text/html; charset=UTF-8"); res.getWriter().write(html); return;
        }

        chain.doFilter(req, res);
    }

    private static String baseStaticHtml(String title, String desc, String url, String image, String type) {
        return """
                <!doctype html>
                <html lang="ro"><head>
                <meta charset="utf-8"/>
                <title>%s</title>
                <link rel="canonical" href="%s"/>
                <meta name="description" content="%s"/>

                <meta property="og:site_name" content="ACS Viitorul Răchiteni"/>
                <meta property="og:type" content="%s"/>
                <meta property="og:title" content="%s"/>
                <meta property="og:description" content="%s"/>
                <meta property="og:url" content="%s"/>
                <meta property="og:image" content="%s"/>

                <meta name="twitter:card" content="summary_large_image"/>
                <meta name="twitter:title" content="%s"/>
                <meta name="twitter:description" content="%s"/>
                <meta name="twitter:image" content="%s"/>
                </head><body>Preview...</body></html>
                """.formatted(title, url, desc, type, title, desc, url, image, title, desc, image);
    }

    private static String escape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                .replace("\"", "&quot;").replace("'", "&#39;");
    }

    private static String abs(String origin, String href) {
        if (href == null || href.isBlank()) return origin + "/favicon.png";
        if (href.startsWith("http")) return href;
        return origin + (href.startsWith("/") ? href : "/" + href);
    }

    private static String slugify(String s) {
        if (s == null) return "";
        String nfd = java.text.Normalizer.normalize(s.toLowerCase(), java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        String slug = nfd.replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
        return URLEncoder.encode(slug.length() > 80 ? slug.substring(0, 80) : slug, StandardCharsets.UTF_8);
    }

    private static String dateStr(LocalDate d) {
        if (d == null) return "";
        return d.toString();
    }
    private static String timeStr(LocalTime t) {
        if (t == null) return "";
        return " · " + t.toString().substring(0,5);
        // better: DateTimeFormatter.ofPattern("HH:mm").format(t)
    }
    private static String locStr(String s) { return (s == null || s.isBlank()) ? "" : " · " + s; }

    private static String isoDateTime(LocalDate d, LocalTime t) {
        if (d == null) return "";
        if (t == null) return d.toString();
        return d.toString() + "T" + t.toString();
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // nu filtrăm asset-uri statice
        return path.startsWith("/assets/") || path.startsWith("/static/") ||
                path.startsWith("/images/") || path.endsWith(".js") || path.endsWith(".css") ||
                path.endsWith(".map") || path.endsWith(".png") || path.endsWith(".jpg") ||
                path.endsWith(".jpeg") || path.endsWith(".webp") || path.endsWith(".svg") ||
                path.endsWith(".ico");
    }
}
