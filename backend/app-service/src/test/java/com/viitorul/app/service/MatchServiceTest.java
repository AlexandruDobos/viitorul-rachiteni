package com.viitorul.app.service;

import com.viitorul.app.dto.MatchDTO;
import com.viitorul.app.dto.MatchPlayerStatDTO;
import com.viitorul.app.entity.*;
import com.viitorul.app.repository.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link MatchService}.
 *
 * Focus on the business rules that are easy to accidentally break:
 *   - a season must belong to the competition it's used with (both on add and update),
 *   - {@code getLastFinished} / {@code getNextMatch} raise a 404 when there is nothing,
 *   - soft-delete only sets the {@code active} flag,
 *   - the "add or update player stat" path really updates in place when a row already exists.
 */
@ExtendWith(MockitoExtension.class)
class MatchServiceTest {

    @Mock private MatchRepository matchRepository;
    @Mock private PlayerRepository playerRepository;
    @Mock private TeamRepository teamRepository;
    @Mock private MatchPlayerStatRepository statRepository;
    @Mock private CompetitionRepository competitionRepository;
    @Mock private CompetitionSeasonRepository seasonRepository;

    @InjectMocks
    private MatchService matchService;

    // ---------- fixtures ----------

    private Team team(long id, String name) {
        Team t = new Team();
        t.setId(id);
        t.setName(name);
        t.setActive(true);
        return t;
    }

    private Competition competition(long id, String name) {
        Competition c = new Competition();
        c.setId(id);
        c.setName(name);
        return c;
    }

    private CompetitionSeason season(long id, String label, Competition parent) {
        CompetitionSeason s = new CompetitionSeason();
        s.setId(id);
        s.setLabel(label);
        s.setCompetition(parent);
        return s;
    }

    private Match match(long id, boolean active) {
        return Match.builder()
                .id(id)
                .homeTeam(team(1L, "Home"))
                .awayTeam(team(2L, "Away"))
                .active(active)
                .build();
    }

    private MatchPlayerStat stat(long id, Match m, Player p, int goals) {
        return MatchPlayerStat.builder()
                .id(id)
                .match(m)
                .player(p)
                .goals(goals)
                .build();
    }

    private Player player(long id, String name) {
        return Player.builder()
                .id(id)
                .name(name)
                .isActive(true)
                .build();
    }

    // ---------- tests ----------

    @Nested
    @DisplayName("addMatch")
    class AddMatch {

        @Test
        @DisplayName("throws when the season does not belong to the selected competition")
        void rejectsMismatchedSeason() {
            Competition cupComp = competition(100L, "Cup");
            Competition leagueComp = competition(200L, "League");
            CompetitionSeason leagueSeason = season(300L, "2025/2026", leagueComp);

            when(teamRepository.findById(1L)).thenReturn(Optional.of(team(1L, "Home")));
            when(teamRepository.findById(2L)).thenReturn(Optional.of(team(2L, "Away")));
            when(competitionRepository.findById(100L)).thenReturn(Optional.of(cupComp));
            when(seasonRepository.findById(300L)).thenReturn(Optional.of(leagueSeason));

            MatchDTO dto = MatchDTO.builder()
                    .homeTeamId(1L).awayTeamId(2L)
                    .competitionId(100L)
                    .seasonId(300L)
                    .build();

            assertThatThrownBy(() -> matchService.addMatch(dto))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Season does not belong");

            verify(matchRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("getLastFinished")
    class GetLastFinished {

        @Test
        @DisplayName("returns 404 when the repository has no finished matches")
        void returns404WhenNothingFinished() {
            when(matchRepository
                    .findFirstByActiveTrueAndHomeGoalsIsNotNullAndAwayGoalsIsNotNullOrderByDateDescKickoffTimeDescIdDesc())
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> matchService.getLastFinished())
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("No finished matches");
        }
    }

    @Nested
    @DisplayName("getNextMatch")
    class GetNextMatch {

        @Test
        @DisplayName("returns 404 when there are no upcoming matches")
        void returns404WhenNoUpcoming() {
            when(matchRepository.findUpcomingMatches()).thenReturn(List.of());

            assertThatThrownBy(() -> matchService.getNextMatch())
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("No upcoming matches");
        }

        @Test
        @DisplayName("returns the first upcoming match when at least one exists")
        void returnsFirstUpcoming() {
            when(matchRepository.findUpcomingMatches())
                    .thenReturn(List.of(match(1L, true), match(2L, true)));

            MatchDTO next = matchService.getNextMatch();

            assertThat(next.getId()).isEqualTo(1L);
        }
    }

    @Nested
    @DisplayName("softDeleteMatch")
    class SoftDelete {

        @Test
        @DisplayName("sets active=false and saves, without physically deleting")
        void softDeletes() {
            Match existing = match(42L, true);
            when(matchRepository.findById(42L)).thenReturn(Optional.of(existing));

            matchService.softDeleteMatch(42L);

            ArgumentCaptor<Match> captor = ArgumentCaptor.forClass(Match.class);
            verify(matchRepository).save(captor.capture());
            assertThat(captor.getValue().isActive()).isFalse();
            verify(matchRepository, never()).delete(any());
        }
    }

    @Nested
    @DisplayName("addOrUpdatePlayerStat")
    class AddOrUpdatePlayerStat {

        @Test
        @DisplayName("updates the existing row in place when one already exists")
        void updatesExisting() {
            Match m = match(10L, true);
            Player p = player(5L, "Player");
            MatchPlayerStat existing = stat(99L, m, p, /*goals*/ 1);

            when(matchRepository.findById(10L)).thenReturn(Optional.of(m));
            when(playerRepository.findById(5L)).thenReturn(Optional.of(p));
            when(statRepository.findByMatch_IdAndPlayer_Id(10L, 5L))
                    .thenReturn(Optional.of(existing));
            when(statRepository.save(any(MatchPlayerStat.class)))
                    .thenAnswer(inv -> inv.getArgument(0));

            MatchPlayerStatDTO update = MatchPlayerStatDTO.builder()
                    .playerId(5L).matchId(10L)
                    .goals(3).assists(2).yellowCards(1).redCard(false)
                    .build();

            MatchPlayerStatDTO result = matchService.addOrUpdatePlayerStat(10L, update);

            assertThat(existing.getGoals()).isEqualTo(3);
            assertThat(existing.getAssists()).isEqualTo(2);
            assertThat(existing.getYellowCards()).isEqualTo(1);
            assertThat(result.getGoals()).isEqualTo(3);
            // Same row, no new entity created.
            verify(statRepository).save(existing);
        }

        @Test
        @DisplayName("creates a new row when none exists yet")
        void createsWhenMissing() {
            Match m = match(10L, true);
            Player p = player(5L, "Player");

            when(matchRepository.findById(10L)).thenReturn(Optional.of(m));
            when(playerRepository.findById(5L)).thenReturn(Optional.of(p));
            when(statRepository.findByMatch_IdAndPlayer_Id(10L, 5L))
                    .thenReturn(Optional.empty());
            when(statRepository.save(any(MatchPlayerStat.class)))
                    .thenAnswer(inv -> inv.getArgument(0));

            MatchPlayerStatDTO input = MatchPlayerStatDTO.builder()
                    .playerId(5L).matchId(10L)
                    .goals(1)
                    .build();

            matchService.addOrUpdatePlayerStat(10L, input);

            ArgumentCaptor<MatchPlayerStat> captor = ArgumentCaptor.forClass(MatchPlayerStat.class);
            verify(statRepository).save(captor.capture());
            MatchPlayerStat saved = captor.getValue();
            assertThat(saved.getMatch()).isSameAs(m);
            assertThat(saved.getPlayer()).isSameAs(p);
            assertThat(saved.getGoals()).isEqualTo(1);
        }
    }

    @Nested
    @DisplayName("patchMatch")
    class PatchMatch {

        @Test
        @DisplayName("clears the season if it no longer belongs to the newly-selected competition")
        void clearsSeasonWhenCompetitionChanges() {
            Competition oldComp = competition(1L, "Cup");
            Competition newComp = competition(2L, "League");
            CompetitionSeason oldSeason = season(11L, "2025/2026", oldComp);
            Match existing = Match.builder()
                    .id(50L)
                    .homeTeam(team(1L, "Home"))
                    .awayTeam(team(2L, "Away"))
                    .competition(oldComp)
                    .season(oldSeason)
                    .active(true)
                    .build();

            when(matchRepository.findById(50L)).thenReturn(Optional.of(existing));
            when(competitionRepository.findById(2L)).thenReturn(Optional.of(newComp));
            when(matchRepository.save(any(Match.class))).thenAnswer(inv -> inv.getArgument(0));

            MatchDTO patch = MatchDTO.builder()
                    .competitionId(2L) // only competitionId, no seasonId
                    .build();

            matchService.patchMatch(50L, patch);

            assertThat(existing.getCompetition()).isEqualTo(newComp);
            assertThat(existing.getSeason()).isNull(); // season was cleared
        }
    }
}
