package com.viitorul.app.service;

import com.viitorul.app.dto.MatchDTO;
import com.viitorul.app.dto.MatchPlayerStatDTO;
import com.viitorul.app.entity.*;
import com.viitorul.app.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final MatchRepository matchRepository;
    private final PlayerRepository playerRepository;
    private final TeamRepository teamRepository;
    private final MatchPlayerStatRepository statRepository;
    private final CompetitionRepository competitionRepository;
    private final CompetitionSeasonRepository seasonRepository;

    public MatchDTO addMatch(MatchDTO dto) {
        Team homeTeam = teamRepository.findById(dto.getHomeTeamId()).orElseThrow();
        Team awayTeam = teamRepository.findById(dto.getAwayTeamId()).orElseThrow();
        List<Player> starting = dto.getStartingPlayerIds() != null
                ? playerRepository.findAllById(dto.getStartingPlayerIds()) : List.of();
        List<Player> subs = dto.getSubstitutePlayerIds() != null
                ? playerRepository.findAllById(dto.getSubstitutePlayerIds()) : List.of();

        Competition competition = null;
        CompetitionSeason season = null;

        if (dto.getCompetitionId() != null) {
            competition = competitionRepository.findById(dto.getCompetitionId())
                    .orElseThrow(() -> new RuntimeException("Competition not found"));
        }

        if (dto.getSeasonId() != null) {
            season = seasonRepository.findById(dto.getSeasonId())
                    .orElseThrow(() -> new RuntimeException("Season not found"));
            if (competition != null && !season.getCompetition().getId().equals(competition.getId())) {
                throw new RuntimeException("Season does not belong to selected competition");
            }
        }

        Match match = Match.builder()
                .homeTeam(homeTeam)
                .awayTeam(awayTeam)
                .date(dto.getDate())
                .kickoffTime(dto.getKickoffTime())
                .location(dto.getLocation())
                .competition(competition)
                .season(season)
                .homeGoals(dto.getHomeGoals())
                .awayGoals(dto.getAwayGoals())
                .notes(dto.getNotes())
                .matchReportUrl(dto.getMatchReportUrl())
                .startingPlayers(starting)
                .substitutePlayers(subs)
                .active(true)
                .build();

        return MatchDTO.toDto(matchRepository.save(match));
    }

    public List<MatchDTO> getUpcomingMatches() {
        return matchRepository.findUpcomingMatches().stream()
                .map(MatchDTO::toDto)
                .toList();
    }

    /** ULTIMUL ADĂUGAT: următorul meci (primul din lista „upcoming”). */
    public MatchDTO getNextMatch() {
        return matchRepository.findUpcomingMatches().stream()
                .findFirst()
                .map(MatchDTO::toDto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No upcoming matches"));
    }

    public MatchDTO getMatchById(Long id) {
        Match match = matchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meciul cu ID " + id + " nu a fost găsit."));
        return MatchDTO.toDto(match);
    }

    public MatchDTO updateMatch(Long id, MatchDTO dto) {
        Match match = matchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Match not found"));

        Team homeTeam = teamRepository.findById(dto.getHomeTeamId())
                .orElseThrow(() -> new RuntimeException("Home team not found"));
        Team awayTeam = teamRepository.findById(dto.getAwayTeamId())
                .orElseThrow(() -> new RuntimeException("Away team not found"));

        match.setHomeTeam(homeTeam);
        match.setAwayTeam(awayTeam);
        match.setDate(dto.getDate());
        match.setKickoffTime(dto.getKickoffTime());
        match.setLocation(dto.getLocation());

        // competition + season
        Competition comp = null;
        if (dto.getCompetitionId() != null) {
            comp = competitionRepository.findById(dto.getCompetitionId())
                    .orElseThrow(() -> new RuntimeException("Competition not found"));
        }
        match.setCompetition(comp);

        CompetitionSeason season = null;
        if (dto.getSeasonId() != null) {
            season = seasonRepository.findById(dto.getSeasonId())
                    .orElseThrow(() -> new RuntimeException("Season not found"));
            if (comp != null && !season.getCompetition().getId().equals(comp.getId())) {
                throw new RuntimeException("Season does not belong to selected competition");
            }
        }
        match.setSeason(season);

        match.setHomeGoals(dto.getHomeGoals());
        match.setAwayGoals(dto.getAwayGoals());
        match.setNotes(dto.getNotes());
        match.setMatchReportUrl(dto.getMatchReportUrl());

        // players
        match.setStartingPlayers(dto.getStartingPlayerIds() != null
                ? playerRepository.findAllById(dto.getStartingPlayerIds())
                : List.of());
        match.setSubstitutePlayers(dto.getSubstitutePlayerIds() != null
                ? playerRepository.findAllById(dto.getSubstitutePlayerIds())
                : List.of());

        return MatchDTO.toDto(matchRepository.save(match));
    }

    public MatchPlayerStatDTO addOrUpdatePlayerStat(Long matchId, MatchPlayerStatDTO dto) {
        Match match = matchRepository.findById(matchId).orElseThrow(() -> new RuntimeException("Match not found"));
        Player player = playerRepository.findById(dto.getPlayerId()).orElseThrow(() -> new RuntimeException("Player not found"));

        MatchPlayerStat stat = statRepository.findByMatch_IdAndPlayer_Id(matchId, dto.getPlayerId())
                .map(existing -> {
                    existing.setGoals(dto.getGoals());
                    existing.setAssists(dto.getAssists());
                    existing.setYellowCards(dto.getYellowCards());
                    existing.setRedCard(dto.isRedCard());
                    return existing;
                })
                .orElse(dto.toEntity(match, player));

        return MatchPlayerStatDTO.toDto(statRepository.save(stat));
    }

    public Match getMatchEntity(Long id) {
        return matchRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Match not found"));
    }

    public List<MatchDTO> getAllMatches() {
        return matchRepository.findAll().stream().map(MatchDTO::toDto).toList();
    }



    /** Rezultate finalizate, ordonate DESC după dată/oră. */
    public List<MatchDTO> getResultsDesc() {
        return matchRepository.findFinishedMatchesDesc().stream()
                .map(MatchDTO::toDto)
                .toList();
    }

    public List<MatchPlayerStatDTO> getStatsForPlayer(Long playerId) {
        return statRepository.findByPlayer_Id(playerId).stream()
                .map(MatchPlayerStatDTO::toDto)
                .toList();
    }

    public List<MatchPlayerStatDTO> getStatsForMatch(Long matchId) {
        return statRepository.findByMatch_Id(matchId).stream()
                .map(MatchPlayerStatDTO::toDto)
                .toList();
    }

    public MatchDTO patchMatch(Long id, MatchDTO dto) {
        Match match = matchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Match not found"));

        if (dto.getDate() != null) match.setDate(dto.getDate());
        if (dto.getKickoffTime() != null) match.setKickoffTime(dto.getKickoffTime());
        if (dto.getLocation() != null) match.setLocation(dto.getLocation());
        if (dto.getHomeGoals() != null) match.setHomeGoals(dto.getHomeGoals());
        if (dto.getAwayGoals() != null) match.setAwayGoals(dto.getAwayGoals());
        if (dto.getNotes() != null) match.setNotes(dto.getNotes());
        if (dto.getMatchReportUrl() != null) match.setMatchReportUrl(dto.getMatchReportUrl());

        if (dto.getHomeTeamId() != null) {
            Team home = teamRepository.findById(dto.getHomeTeamId()).orElseThrow();
            match.setHomeTeam(home);
        }
        if (dto.getAwayTeamId() != null) {
            Team away = teamRepository.findById(dto.getAwayTeamId()).orElseThrow();
            match.setAwayTeam(away);
        }

        // PATCH competition/season
        if (dto.getCompetitionId() != null) {
            Competition comp = competitionRepository.findById(dto.getCompetitionId())
                    .orElseThrow(() -> new RuntimeException("Competition not found"));
            match.setCompetition(comp);

            if (match.getSeason() != null &&
                    !match.getSeason().getCompetition().getId().equals(comp.getId())) {
                match.setSeason(null);
            }
        } else if (dto.getSeasonId() != null) {
            CompetitionSeason season = seasonRepository.findById(dto.getSeasonId())
                    .orElseThrow(() -> new RuntimeException("Season not found"));
            if (match.getCompetition() != null &&
                    !season.getCompetition().getId().equals(match.getCompetition().getId())) {
                throw new RuntimeException("Season does not belong to current competition");
            }
            match.setSeason(season);
        }

        if (dto.getStartingPlayerIds() != null) {
            match.setStartingPlayers(playerRepository.findAllById(dto.getStartingPlayerIds()));
        }
        if (dto.getSubstitutePlayerIds() != null) {
            match.setSubstitutePlayers(playerRepository.findAllById(dto.getSubstitutePlayerIds()));
        }

        return MatchDTO.toDto(matchRepository.save(match));
    }

    public List<MatchPlayerStatDTO> addOrUpdatePlayerStatsBatch(Long matchId, List<MatchPlayerStatDTO> dtos) {
        return dtos.stream()
                .map(dto -> addOrUpdatePlayerStat(matchId, dto))
                .toList();
    }

    public void softDeleteMatch(Long id) {
        Match match = matchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Match not found"));
        match.setActive(false);
        matchRepository.save(match);
    }
}
