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

    // ~60s pentru pagini lente
    private static final int TIMEOUT_MS = 60_000;

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
                .setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
                        "AppleWebKit/537.36 (KHTML, like Gecko) " +
                        "Chrome/127.0.0.0 Safari/537.36")
                .setViewportSize(1280, 900)
                .setLocale("ro-RO")
                .setTimezoneId("Europe/Bucharest");
    }

    public String fetchRenderedHtml(String url) {
        try (Playwright pw = Playwright.create()) {
            Browser browser = pw.chromium().launch(launchOptions());
            BrowserContext ctx = browser.newContext(contextOptions());
            Page page = ctx.newPage();
            page.setDefaultTimeout(TIMEOUT_MS);

            // warm-up pe domeniu (cookie-uri)
            try {
                page.navigate("https://www.frf-ajf.ro/",
                        new Page.NavigateOptions().setWaitUntil(WaitUntilState.DOMCONTENTLOADED));
            } catch (Exception ignore) {}

            // navighează la URL-ul țintă
            page.navigate(url, new Page.NavigateOptions().setWaitUntil(WaitUntilState.NETWORKIDLE));

            // asigură-te că tabelul există (selectorul tău din scraper)
            page.waitForSelector("table.table.table-hover.table-bordered");

            String html = page.content();

            ctx.close();
            browser.close();
            return html;
        }
    }
}
