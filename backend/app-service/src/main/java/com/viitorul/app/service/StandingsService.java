package com.viitorul.app.service;

import com.viitorul.app.dto.*;
import com.viitorul.app.entity.StandingsConfig;
import com.viitorul.app.entity.StandingsRow;
import com.viitorul.app.repository.StandingsConfigRepository;
import com.viitorul.app.repository.StandingsRowRepository;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StandingsService {

    private final StandingsRowRepository rowRepository;
    private final StandingsConfigRepository configRepository;
    private static final ZoneId ZONE_RO = ZoneId.of("Europe/Bucharest");

    public StandingsResponseDTO getCurrent() {
        var config = getOrCreateConfig();
        var rows = rowRepository.findLatestSnapshot();
        var last = rowRepository.findMaxSnapshotAt();

        return StandingsResponseDTO.builder()
                .sourceUrl(config.getSourceUrl())
                .scheduleEnabled(config.isScheduleEnabled())
                .lastUpdated(last)
                .rows(rows.stream().map(StandingsRowDTO::toDto).toList())
                .build();
    }

    public StandingsResponseDTO getConfigOnly() {
        var config = getOrCreateConfig();
        return StandingsResponseDTO.builder()
                .sourceUrl(config.getSourceUrl())
                .scheduleEnabled(config.isScheduleEnabled())
                .lastUpdated(rowRepository.findMaxSnapshotAt())
                .rows(null)
                .build();
    }

// com.viitorul.app.service.StandingsService

    @Transactional
    public StandingsResponseDTO saveManual(StandingsSaveRequestDTO req) {
        var snapshot = OffsetDateTime.now(ZONE_RO);

        // 1) actualizează config
        var config = getOrCreateConfig();
        config.setSourceUrl(req.getSourceUrl());
        config.setUpdatedAt(snapshot);
        configRepository.save(config);

        // 2) OVERWRITE: șterge clasamentul curent
        rowRepository.deleteAllInBatch(); // <- important

        // 3) inserează rândurile noi (toate)
        var entities = req.getRows().stream().map(r -> StandingsRow.builder()
                .rank(r.getRank())
                .teamName(r.getTeamName())
                .teamUrl(r.getTeamUrl())
                .played(r.getPlayed())
                .wins(r.getWins())
                .draws(r.getDraws())
                .losses(r.getLosses())
                .goalsFor(r.getGoalsFor())
                .goalsAgainst(r.getGoalsAgainst())
                .points(r.getPoints())
                .snapshotAt(snapshot)
                .build()
        ).toList();

        rowRepository.saveAll(entities);

        return StandingsResponseDTO.builder()
                .sourceUrl(config.getSourceUrl())
                .scheduleEnabled(config.isScheduleEnabled())
                .lastUpdated(snapshot)
                .rows(entities.stream().map(StandingsRowDTO::toDto).toList())
                .build();
    }

    @Transactional
    public StandingsResponseDTO scrapeAndSave(String url) throws IOException {
        var rows = scrape(url);
        var snapshot = OffsetDateTime.now(ZONE_RO);

        var config = getOrCreateConfig();
        config.setSourceUrl(url);
        config.setUpdatedAt(snapshot);
        configRepository.save(config);

        // OVERWRITE: șterge clasamentul curent
        rowRepository.deleteAllInBatch(); // <- important

        var entities = rows.stream().map(r -> StandingsRow.builder()
                .rank(r.getRank())
                .teamName(r.getTeamName())
                .teamUrl(r.getTeamUrl())
                .played(r.getPlayed())
                .wins(r.getWins())
                .draws(r.getDraws())
                .losses(r.getLosses())
                .goalsFor(r.getGoalsFor())
                .goalsAgainst(r.getGoalsAgainst())
                .points(r.getPoints())
                .snapshotAt(snapshot)
                .build()
        ).toList();

        rowRepository.saveAll(entities);

        return StandingsResponseDTO.builder()
                .sourceUrl(config.getSourceUrl())
                .scheduleEnabled(config.isScheduleEnabled())
                .lastUpdated(snapshot)
                .rows(entities.stream().map(StandingsRowDTO::toDto).toList())
                .build();
    }

    @Transactional
    public void setScheduleEnabled(boolean enabled) {
        var c = getOrCreateConfig();
        c.setScheduleEnabled(enabled);
        c.setUpdatedAt(OffsetDateTime.now(ZONE_RO));
        configRepository.save(c);
    }

    public boolean isScheduleEnabled() {
        return getOrCreateConfig().isScheduleEnabled();
    }

    // ——— Scraper JSoup (strict pe structura indicată) ———
    private List<StandingsRowDTO> scrape(String url) throws IOException {
        Document doc = Jsoup.connect(url)
                .userAgent("Mozilla/5.0 (compatible; ViitorulStandingsBot/1.0)")
                .timeout(20000)
                .get();

        Element container = doc.selectFirst("div.col-md-9");
        if (container == null) container = doc;

        Element table = container.selectFirst("table.table.table-hover.table-bordered");
        if (table == null) throw new IOException("Nu am găsit tabelul de clasament");

        List<StandingsRowDTO> out = new ArrayList<>();
        Elements trs = table.select("tbody > tr");

        for (Element tr : trs) {
            Elements tds = tr.select("td");
            if (tds.size() < 9) continue;

            // 0:# 1:Echipa 2:M 3:V 4:E 5:I 6:GM 7:GP 8:P
            String rankText = tds.get(0).text().trim();
            Integer rank = parseStrictInt(rankText);    // <- doar cifre, altfel null
            if (rank == null) {
                // e header sau alt rând non-date -> îl sărim
                continue;
            }

            Element teamCell = tds.get(1);
            Element a = teamCell.selectFirst("a");
            String teamName = a != null ? a.text().trim() : teamCell.text().trim();
            String teamUrl  = a != null ? a.absUrl("href") : null;

            Integer played      = parseLenientInt(tds.get(2).text());
            Integer wins        = parseLenientInt(tds.get(3).text());
            Integer draws       = parseLenientInt(tds.get(4).text());
            Integer losses      = parseLenientInt(tds.get(5).text());
            Integer goalsFor    = parseLenientInt(tds.get(6).text());
            Integer goalsAgainst= parseLenientInt(tds.get(7).text());
            Integer points      = parseLenientInt(tds.get(8).text().replace("p","").replace("P",""));

            // doar rânduri cu nume de echipă real
            if (teamName == null || teamName.isBlank() || teamName.equalsIgnoreCase("Echipa")) continue;

            out.add(StandingsRowDTO.builder()
                    .rank(rank)
                    .teamName(teamName)
                    .teamUrl(teamUrl)
                    .played(played)
                    .wins(wins)
                    .draws(draws)
                    .losses(losses)
                    .goalsFor(goalsFor)
                    .goalsAgainst(goalsAgainst)
                    .points(points)
                    .build());
        }

        return out;
    }

    // acceptă doar cifre 100% (ex: "12"); pentru "#", "—" etc. returnează null
    private static Integer parseStrictInt(String s) {
        String t = s == null ? "" : s.trim();
        if (!t.matches("\\d+")) return null;
        try { return Integer.valueOf(t); } catch (Exception e) { return null; }
    }

    // acceptă și texte cu spații; dacă nu se poate, returnează null
    private static Integer parseLenientInt(String s) {
        try { return Integer.valueOf(s.trim()); } catch (Exception e) { return null; }
    }


    private StandingsConfig getOrCreateConfig() {
        return configRepository.findAll().stream().findFirst()
                .orElseGet(() -> configRepository.save(
                        StandingsConfig.builder()
                                .sourceUrl("https://www.frf-ajf.ro/iasi/competitii-fotbal/liga-a-v-a-seria-iii-13761/clasament")
                                .scheduleEnabled(true)
                                .updatedAt(OffsetDateTime.now(ZONE_RO))
                                .build()
                ));
    }
}
