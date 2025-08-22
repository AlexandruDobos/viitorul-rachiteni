package com.viitorul.app.api;

import com.viitorul.app.dto.MatchDTO;
import com.viitorul.app.dto.MatchPlayerStatDTO;
import com.viitorul.app.service.MatchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    @GetMapping("/upcoming")
    public ResponseEntity<List<MatchDTO>> getUpcomingMatches() {
        return ResponseEntity.ok(matchService.getUpcomingMatches());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MatchDTO> getMatchById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(matchService.getMatchById(id));
    }


    // Stats pentru un jucător (opțional, nu e folosit de front-ul dat)
    @GetMapping("/player/{id}/stats")
    public ResponseEntity<List<MatchPlayerStatDTO>> getStatsForPlayer(@PathVariable("id") Long id) {
        return ResponseEntity.ok(matchService.getStatsForPlayer(id));
    }

    // Stats pentru un meci (GET) -> folosit de MatchStatsEditor.jsx
    @GetMapping("/player-stats/{matchId}")
    public ResponseEntity<List<MatchPlayerStatDTO>> getMatchStats(@PathVariable("matchId") Long matchId) {
        return ResponseEntity.ok(matchService.getStatsForMatch(matchId));
    }

    // Upsert stats pentru un jucător într-un meci (POST) -> folosit de MatchStatsEditor.jsx
    @PostMapping("/{matchId}/stats")
    public ResponseEntity<MatchPlayerStatDTO> addOrUpdatePlayerStat(
            @PathVariable("matchId") Long matchId,
            @RequestBody MatchPlayerStatDTO dto
    ) {
        return ResponseEntity.ok(matchService.addOrUpdatePlayerStat(matchId, dto));
    }

    // Upsert în batch (opțional)
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
