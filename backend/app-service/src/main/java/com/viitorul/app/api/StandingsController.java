package com.viitorul.app.api;

import com.viitorul.app.dto.*;
import com.viitorul.app.service.StandingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/app/standings")
@RequiredArgsConstructor
public class StandingsController {

    private final StandingsService standingsService;

    @GetMapping
    public ResponseEntity<StandingsResponseDTO> getCurrent() {
        return ResponseEntity.ok(standingsService.getCurrent());
    }

    @PutMapping
    public ResponseEntity<StandingsResponseDTO> saveManual(@Valid @RequestBody StandingsSaveRequestDTO req) {
        log.info("Standings manual save requested");
        return ResponseEntity.ok(standingsService.saveManual(req));
    }

    @PostMapping("/scrape")
    public ResponseEntity<?> scrape(@Valid @RequestBody ScrapeRequestDTO req) {
        log.info("Standings scrape requested: {}", req.getUrl());
        try {
            var dto = standingsService.scrapeAndSave(req.getUrl());
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Scrape failed for {}: {}", req.getUrl(), e.toString(), e);
            return ResponseEntity.status(500).body(Map.of(
                    "error", "SCRAPE_FAILED",
                    "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/config")
    public ResponseEntity<StandingsResponseDTO> getConfig() {
        return ResponseEntity.ok(standingsService.getConfigOnly());
    }

    @PostMapping("/schedule")
    public ResponseEntity<Void> toggleSchedule(@Valid @RequestBody ScheduleToggleRequestDTO req) {
        standingsService.setScheduleEnabled(req.getEnabled());
        return ResponseEntity.noContent().build();
    }
}
