package com.viitorul.app.service;

import com.viitorul.app.dto.TeamDTO;
import com.viitorul.app.entity.Team;
import com.viitorul.app.repository.TeamRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link TeamService}.
 *
 * The service depends on {@link TeamRepository}; we replace the real repository
 * with a Mockito mock so we can:
 *   - control what "the database" returns,
 *   - verify the interactions the service made with it.
 *
 * No Spring context is started (much faster than {@code @SpringBootTest}).
 * This is the template for testing any service that mostly composes repository
 * calls with a bit of business logic.
 */
@ExtendWith(MockitoExtension.class)
class TeamServiceTest {

    @Mock
    private TeamRepository teamRepository;

    @InjectMocks
    private TeamService teamService;

    private Team activeTeam(long id, String name) {
        Team t = new Team();
        t.setId(id);
        t.setName(name);
        t.setLogo("logo-" + id + ".png");
        t.setActive(true);
        return t;
    }

    @Nested
    @DisplayName("getAllTeams")
    class GetAllTeams {

        @Test
        @DisplayName("returns only active teams mapped to DTOs")
        void returnsActiveTeamsAsDto() {
            when(teamRepository.findByActiveTrue()).thenReturn(List.of(
                    activeTeam(1L, "Viitorul"),
                    activeTeam(2L, "Biruința")
            ));

            List<TeamDTO> result = teamService.getAllTeams();

            assertThat(result)
                    .hasSize(2)
                    .extracting(TeamDTO::getName)
                    .containsExactly("Viitorul", "Biruința");
            verify(teamRepository).findByActiveTrue();
        }

        @Test
        @DisplayName("returns an empty list when the repository has no active teams")
        void returnsEmptyListWhenNoActiveTeams() {
            when(teamRepository.findByActiveTrue()).thenReturn(List.of());

            assertThat(teamService.getAllTeams()).isEmpty();
        }
    }

    @Nested
    @DisplayName("getTeamById")
    class GetTeamById {

        @Test
        @DisplayName("returns the team when it exists and is active")
        void returnsActiveTeam() {
            Team team = activeTeam(42L, "Viitorul");
            when(teamRepository.findById(42L)).thenReturn(Optional.of(team));

            TeamDTO dto = teamService.getTeamById(42L);

            assertThat(dto.getId()).isEqualTo(42L);
            assertThat(dto.getName()).isEqualTo("Viitorul");
        }

        @Test
        @DisplayName("throws when the team does not exist")
        void throwsWhenNotFound() {
            when(teamRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> teamService.getTeamById(99L))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("not found");
        }

        @Test
        @DisplayName("throws when the team exists but is inactive (deactivated)")
        void throwsWhenInactive() {
            Team inactive = activeTeam(7L, "Viitorul");
            inactive.setActive(false);
            when(teamRepository.findById(7L)).thenReturn(Optional.of(inactive));

            assertThatThrownBy(() -> teamService.getTeamById(7L))
                    .isInstanceOf(RuntimeException.class);
        }
    }

    @Nested
    @DisplayName("createTeam")
    class CreateTeam {

        @Test
        @DisplayName("persists a new team using the values from the DTO")
        void persistsNewTeam() {
            TeamDTO input = new TeamDTO();
            input.setName("New Team");
            input.setLogo("new.png");

            when(teamRepository.save(any(Team.class))).thenAnswer(inv -> {
                Team t = inv.getArgument(0);
                t.setId(123L);
                return t;
            });

            TeamDTO result = teamService.createTeam(input);

            ArgumentCaptor<Team> captor = ArgumentCaptor.forClass(Team.class);
            verify(teamRepository).save(captor.capture());
            Team saved = captor.getValue();

            assertThat(saved.getName()).isEqualTo("New Team");
            assertThat(saved.getLogo()).isEqualTo("new.png");
            assertThat(result.getId()).isEqualTo(123L);
        }
    }

    @Nested
    @DisplayName("deactivateTeam")
    class DeactivateTeam {

        @Test
        @DisplayName("marks the team as inactive without deleting it")
        void marksTeamInactive() {
            Team team = activeTeam(5L, "To be deactivated");
            when(teamRepository.findById(5L)).thenReturn(Optional.of(team));

            teamService.deactivateTeam(5L);

            ArgumentCaptor<Team> captor = ArgumentCaptor.forClass(Team.class);
            verify(teamRepository).save(captor.capture());
            assertThat(captor.getValue().isActive()).isFalse();
            verify(teamRepository, never()).delete(any());
        }
    }
}
