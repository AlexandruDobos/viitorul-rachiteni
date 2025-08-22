// src/main/java/com/viitorul/app/api/CompetitionController.java
package com.viitorul.app.api;

import com.viitorul.app.dto.CompetitionDTO;
import com.viitorul.app.dto.CompetitionSeasonDTO;
import com.viitorul.app.service.CompetitionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/app/competitions")
public class CompetitionController {

    @Autowired
    private CompetitionService competitionService;

    // ---------- COMPETITIONS ----------
    @GetMapping
    public List<CompetitionDTO> getAllCompetitions() {
        return competitionService.getAllCompetitions();
    }

    @GetMapping("/{id}")
    public CompetitionDTO getCompetitionById(@PathVariable("id") Long id) {
        return competitionService.getCompetitionById(id);
    }

    @PostMapping
    public CompetitionDTO createCompetition(@RequestBody CompetitionDTO dto) {
        return competitionService.createCompetition(dto);
    }

    @PutMapping("/{id}")
    public CompetitionDTO updateCompetition(@PathVariable("id") Long id, @RequestBody CompetitionDTO dto) {
        return competitionService.updateCompetition(id, dto);
    }

    @DeleteMapping("/{id}")
    public void deactivateCompetition(@PathVariable("id") Long id) {
        competitionService.deactivateCompetition(id);
    }

    // ---------- SEASONS under a competition ----------
    @GetMapping("/{competitionId}/seasons")
    public List<CompetitionSeasonDTO> getSeasonsForCompetition(@PathVariable("competitionId") Long competitionId) {
        return competitionService.getSeasonsForCompetition(competitionId);
    }

    @PostMapping("/{competitionId}/seasons")
    public CompetitionSeasonDTO createSeason(
            @PathVariable("competitionId") Long competitionId,
            @RequestBody CompetitionSeasonDTO dto
    ) {
        return competitionService.createSeason(competitionId, dto);
    }

    @PutMapping("/{competitionId}/seasons/{seasonId}")
    public CompetitionSeasonDTO updateSeason(
            @PathVariable("competitionId") Long competitionId,
            @PathVariable("seasonId") Long seasonId,
            @RequestBody CompetitionSeasonDTO dto
    ) {
        return competitionService.updateSeason(competitionId, seasonId, dto);
    }

    @DeleteMapping("/{competitionId}/seasons/{seasonId}")
    public void deactivateSeason(
            @PathVariable("competitionId") Long competitionId,
            @PathVariable("seasonId") Long seasonId
    ) {
        competitionService.deactivateSeason(competitionId, seasonId);
    }
}
