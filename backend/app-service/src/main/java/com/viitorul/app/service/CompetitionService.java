// src/main/java/com/viitorul/app/service/CompetitionService.java
package com.viitorul.app.service;

import com.viitorul.app.dto.CompetitionDTO;
import com.viitorul.app.dto.CompetitionSeasonDTO;
import com.viitorul.app.entity.Competition;
import com.viitorul.app.entity.CompetitionSeason;
import com.viitorul.app.repository.CompetitionRepository;
import com.viitorul.app.repository.CompetitionSeasonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CompetitionService {

    @Autowired
    private CompetitionRepository competitionRepository;

    @Autowired
    private CompetitionSeasonRepository seasonRepository;

    // ---------- COMPETITIONS ----------
    public List<CompetitionDTO> getAllCompetitions() {
        return competitionRepository.findByActiveTrue().stream()
                .map(c -> CompetitionDTO.fromEntity(c, true))
                .collect(Collectors.toList());
    }

    public CompetitionDTO getCompetitionById(Long id) {
        Competition c = competitionRepository.findById(id)
                .filter(Competition::isActive)
                .orElseThrow(() -> new RuntimeException("Competition not found"));
        return CompetitionDTO.fromEntity(c, true);
    }

    public CompetitionDTO createCompetition(CompetitionDTO dto) {
        Competition c = new Competition();
        c.setName(dto.getName());
        c.setActive(true);
        Competition saved = competitionRepository.save(c);

        // Optionally create seasons passed in DTO
        if (dto.getSeasons() != null && !dto.getSeasons().isEmpty()) {
            for (CompetitionSeasonDTO sDto : dto.getSeasons()) {
                CompetitionSeason s = new CompetitionSeason();
                s.setLabel(sDto.getLabel());
                s.setActive(true);
                s.setCompetition(saved);
                seasonRepository.save(s);
            }
        }
        // reload with seasons
        return getCompetitionById(saved.getId());
    }

    public CompetitionDTO updateCompetition(Long id, CompetitionDTO dto) {
        Competition c = competitionRepository.findById(id)
                .filter(Competition::isActive)
                .orElseThrow(() -> new RuntimeException("Competition not found"));
        c.setName(dto.getName());
        Competition saved = competitionRepository.save(c);
        return CompetitionDTO.fromEntity(saved, true);
    }

    public void deactivateCompetition(Long id) {
        Competition c = competitionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Competition not found"));
        c.setActive(false);
        competitionRepository.save(c);
    }

    // ---------- SEASONS ----------
    public List<CompetitionSeasonDTO> getSeasonsForCompetition(Long competitionId) {
        // ensures competition exists & active
        competitionRepository.findById(competitionId)
                .filter(Competition::isActive)
                .orElseThrow(() -> new RuntimeException("Competition not found"));
        return seasonRepository.findByCompetitionIdAndActiveTrue(competitionId).stream()
                .map(CompetitionSeasonDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public CompetitionSeasonDTO createSeason(Long competitionId, CompetitionSeasonDTO dto) {
        Competition c = competitionRepository.findById(competitionId)
                .filter(Competition::isActive)
                .orElseThrow(() -> new RuntimeException("Competition not found"));

        CompetitionSeason s = new CompetitionSeason();
        s.setLabel(dto.getLabel());
        s.setActive(true);
        s.setCompetition(c);

        CompetitionSeason saved = seasonRepository.save(s);
        return CompetitionSeasonDTO.fromEntity(saved);
    }

    public CompetitionSeasonDTO updateSeason(Long competitionId, Long seasonId, CompetitionSeasonDTO dto) {
        CompetitionSeason s = seasonRepository.findByIdAndCompetitionId(seasonId, competitionId)
                .orElseThrow(() -> new RuntimeException("Season not found"));
        if (!s.isActive()) {
            throw new RuntimeException("Season is inactive");
        }
        s.setLabel(dto.getLabel());
        CompetitionSeason saved = seasonRepository.save(s);
        return CompetitionSeasonDTO.fromEntity(saved);
    }

    public void deactivateSeason(Long competitionId, Long seasonId) {
        CompetitionSeason s = seasonRepository.findByIdAndCompetitionId(seasonId, competitionId)
                .orElseThrow(() -> new RuntimeException("Season not found"));
        s.setActive(false);
        seasonRepository.save(s);
    }
}
