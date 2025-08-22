package com.viitorul.app.scheduler;

import com.viitorul.app.dto.StandingsResponseDTO;
import com.viitorul.app.service.StandingsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class StandingsScheduler {

    private final StandingsService standingsService;

    // Duminica la 15:00 (ora României)
    @Scheduled(cron = "0 0 15 ? * SUN", zone = "Europe/Bucharest")
    public void runSunday15() {
        runIfEnabled("15:00");
    }

    // Duminica la 20:00 (ora României)
    @Scheduled(cron = "0 0 20 ? * SUN", zone = "Europe/Bucharest")
    public void runSunday20() {
        runIfEnabled("20:00");
    }

    private void runIfEnabled(String label) {
        try {
            if (!standingsService.isScheduleEnabled()) {
                log.info("[StandingsScheduler {}] Skip: schedule disabled.", label);
                return;
            }

            StandingsResponseDTO conf = standingsService.getConfigOnly();
            String url = conf.getSourceUrl();
            if (url == null || url.isBlank()) {
                log.warn("[StandingsScheduler {}] Skip: sourceUrl lipsă.", label);
                return;
            }

            log.info("[StandingsScheduler {}] Scraping {}", label, url);
            standingsService.scrapeAndSave(url);
            log.info("[StandingsScheduler {}] OK.", label);
        } catch (Exception e) {
            log.error("[StandingsScheduler {}] Failed: {}", label, e.getMessage(), e);
        }
    }
}
