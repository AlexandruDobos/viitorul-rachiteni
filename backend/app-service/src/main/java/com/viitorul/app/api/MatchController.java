package com.viitorul.app.api;

import com.viitorul.app.dto.MatchDTO;
import com.viitorul.app.dto.MatchPlayerStatDTO;
import com.viitorul.app.service.MatchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/app/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    @PostMapping
    public ResponseEntity<MatchDTO> addMatch(@RequestBody MatchDTO matchDTO) {
        log.info("Creare meci nou");
        return ResponseEntity.ok(matchService.addMatch(matchDTO));
    }

    @GetMapping
    public ResponseEntity<List<MatchDTO>> getAllMatches() {
        return ResponseEntity.ok(matchService.getAllMatches());
    }

    @GetMapping("/page")
    public ResponseEntity<Page<MatchDTO>> getMatchesPaged(
            @RequestParam(name = "q", required = false, defaultValue = "") String q,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(matchService.getAllMatchesPaged(q, pageable));
    }

    /** NOU: un singur meci – următorul programat */
    @GetMapping("/next")
    public ResponseEntity<MatchDTO> getNextMatch() {
        return ResponseEntity.ok(matchService.getNextMatch());
    }

    @GetMapping("/results")
    public ResponseEntity<Page<MatchDTO>> getResultsPaged(
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "seasonId", required = false) Long seasonId,
            @RequestParam(value = "seasonLabel", required = false) String seasonLabel,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        if (seasonLabel != null) {
            String s = seasonLabel.trim();
            if (s.isEmpty() || s.equalsIgnoreCase("toate")) {
                seasonLabel = null;
            }
        }
        Pageable pageable = PageRequest.of(page, size);
        Page<MatchDTO> result = matchService.getFinishedMatchesPaged(q, seasonId, seasonLabel, pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/results/seasons")
    public ResponseEntity<List<String>> getResultsSeasons() {
        return ResponseEntity.ok(matchService.getFinishedSeasons());
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<MatchDTO>> getUpcomingMatches() {
        return ResponseEntity.ok(matchService.getUpcomingMatches());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MatchDTO> getMatchById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(matchService.getMatchById(id));
    }

    /** ✅ NOU: filtrare opțională după sezon + sortare DESC făcută în service/repo */
    @GetMapping("/player/{id}/stats")
    public ResponseEntity<List<MatchPlayerStatDTO>> getStatsForPlayer(
            @PathVariable("id") Long id,
            @RequestParam(value = "seasonId", required = false) Long seasonId
    ) {
        return ResponseEntity.ok(matchService.getStatsForPlayer(id, seasonId));
    }

    @GetMapping("/player-stats/{matchId}")
    public ResponseEntity<List<MatchPlayerStatDTO>> getMatchStats(@PathVariable("matchId") Long matchId) {
        return ResponseEntity.ok(matchService.getStatsForMatch(matchId));
    }

    @PostMapping("/{matchId}/stats")
    public ResponseEntity<MatchPlayerStatDTO> addOrUpdatePlayerStat(
            @PathVariable("matchId") Long matchId,
            @RequestBody MatchPlayerStatDTO dto
    ) {
        return ResponseEntity.ok(matchService.addOrUpdatePlayerStat(matchId, dto));
    }

    @PostMapping("/{matchId}/stats/batch")
    public ResponseEntity<List<MatchPlayerStatDTO>> addOrUpdatePlayerStatsBatch(
            @PathVariable("matchId") Long matchId,
            @RequestBody List<MatchPlayerStatDTO> dtos
    ) {
        return ResponseEntity.ok(matchService.addOrUpdatePlayerStatsBatch(matchId, dtos));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MatchDTO> updateMatch(
            @PathVariable("id") Long id,
            @RequestBody MatchDTO matchDTO
    ) {
        return ResponseEntity.ok(matchService.updateMatch(id, matchDTO));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<MatchDTO> patchMatch(
            @PathVariable("id") Long id,
            @RequestBody MatchDTO matchDTO
    ) {
        return ResponseEntity.ok(matchService.patchMatch(id, matchDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMatch(@PathVariable("id") Long id) {
        matchService.softDeleteMatch(id);
        return ResponseEntity.ok().build();
    }
}
