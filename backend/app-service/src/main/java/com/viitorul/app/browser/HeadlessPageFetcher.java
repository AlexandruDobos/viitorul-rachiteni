package com.viitorul.app.browser;

import com.microsoft.playwright.*;
import com.microsoft.playwright.options.WaitUntilState;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Deschide Chromium headless, încarcă pagina, așteaptă să se liniștească rețeaua
 * și returnează HTML-ul randat (page.content()).
 */
@Component
public class HeadlessPageFetcher {

    /**
     * User-Agent folosit atât de Playwright cât și de fallback-ul JSoup.
     * ATENȚIE: frf-ajf.ro (prin Cloudflare) răspunde cu 520 la UA-uri Chrome vechi
     * (ex. Chrome/127). Ține versiunea apropiată de Chrome stable curent.
     */
    public static final String USER_AGENT =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
            "AppleWebKit/537.36 (KHTML, like Gecko) " +
            "Chrome/142.0.0.0 Safari/537.36";

    // Bugetul total trebuie să rămână sub timeout-ul Cloudflare/nginx (~100s / 60s),
    // altfel clientul primește timeout în loc de eroarea reală.
    private static final int WARMUP_TIMEOUT_MS = 10_000;
    private static final int NAVIGATE_TIMEOUT_MS = 25_000;
    private static final int SELECTOR_TIMEOUT_MS = 10_000;

    private static BrowserType.LaunchOptions launchOptions() {
        return new BrowserType.LaunchOptions()
                .setHeadless(true)
                .setArgs(List.of(
                        "--no-sandbox",
                        "--disable-gpu",
                        "--disable-dev-shm-usage"
                ));
    }

    private static Browser.NewContextOptions contextOptions() {
        return new Browser.NewContextOptions()
                .setUserAgent(USER_AGENT)
                .setViewportSize(1280, 900)
                .setLocale("ro-RO")
                .setTimezoneId("Europe/Bucharest");
    }

    public String fetchRenderedHtml(String url) {
        try (Playwright pw = Playwright.create()) {
            Browser browser = pw.chromium().launch(launchOptions());
            BrowserContext ctx = browser.newContext(contextOptions());
            Page page = ctx.newPage();
            // warm-up pe domeniu (cookie-uri)
            try {
                page.navigate("https://www.frf-ajf.ro/",
                        new Page.NavigateOptions()
                                .setWaitUntil(WaitUntilState.DOMCONTENTLOADED)
                                .setTimeout(WARMUP_TIMEOUT_MS));
            } catch (Exception ignore) {}

            // navighează la URL-ul țintă (LOAD, nu NETWORKIDLE: reclamele/analytics țin rețeaua activă)
            Response resp = page.navigate(url, new Page.NavigateOptions()
                    .setWaitUntil(WaitUntilState.LOAD)
                    .setTimeout(NAVIGATE_TIMEOUT_MS));

            // fail fast dacă site-ul ne blochează (ex. 520/403), nu mai aștepta selectorul degeaba
            if (resp != null && !resp.ok()) {
                throw new IllegalStateException("HTTP " + resp.status() + " from " + url);
            }

            // asigură-te că tabelul există (selectorul tău din scraper)
            page.waitForSelector("table.table.table-hover.table-bordered",
                    new Page.WaitForSelectorOptions().setTimeout(SELECTOR_TIMEOUT_MS));

            String html = page.content();

            ctx.close();
            browser.close();
            return html;
        }
    }
}
