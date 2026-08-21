package com.viitorul.app.service;

import com.viitorul.app.dto.PlayerDTO;
import com.viitorul.app.entity.Player;
import com.viitorul.app.repository.PlayerRepository;
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
 * Unit tests for {@link PlayerService}.
 *
 * Focus on the branching logic in {@code addPlayer}, {@code updatePlayer},
 * and the soft-delete flow — the parts most likely to regress silently.
 */
@ExtendWith(MockitoExtension.class)
class PlayerServiceTest {

    @Mock
    private PlayerRepository playerRepository;

    @InjectMocks
    private PlayerService playerService;

    private Player samplePlayer(long id, String name, boolean active) {
        return Player.builder()
                .id(id)
                .name(name)
                .position("Midfielder")
                .shirtNumber(10)
                .isActive(active)
                .build();
    }

    @Nested
    @DisplayName("addPlayer")
    class AddPlayer {

        @Test
        @DisplayName("defaults isActive to true when the DTO does not specify it")
        void defaultsIsActiveToTrue() {
            PlayerDTO input = PlayerDTO.builder()
                    .name("New Player")
                    .position("Forward")
                    .shirtNumber(9)
                    .build(); // isActive intentionally left null

            when(playerRepository.save(any(Player.class))).thenAnswer(inv -> {
                Player p = inv.getArgument(0);
                p.setId(1L);
                return p;
            });

            PlayerDTO result = playerService.addPlayer(input);

            ArgumentCaptor<Player> captor = ArgumentCaptor.forClass(Player.class);
            verify(playerRepository).save(captor.capture());
            assertThat(captor.getValue().getIsActive()).isTrue();
            assertThat(result.getIsActive()).isTrue();
        }

        @Test
        @DisplayName("respects an explicit isActive=false in the DTO")
        void respectsExplicitIsActiveFalse() {
            PlayerDTO input = PlayerDTO.builder()
                    .name("Bench Player")
                    .isActive(false)
                    .build();

            when(playerRepository.save(any(Player.class))).thenAnswer(inv -> inv.getArgument(0));

            playerService.addPlayer(input);

            ArgumentCaptor<Player> captor = ArgumentCaptor.forClass(Player.class);
            verify(playerRepository).save(captor.capture());
            assertThat(captor.getValue().getIsActive()).isFalse();
        }
    }

    @Nested
    @DisplayName("getAllPlayers")
    class GetAllPlayers {

        @Test
        @DisplayName("uses the active-only repository method when activeOnly=true")
        void activeOnlyPath() {
            when(playerRepository.findAllByIsActiveTrueOrderByNameAsc())
                    .thenReturn(List.of(samplePlayer(1L, "Alice", true)));

            List<PlayerDTO> result = playerService.getAllPlayers(true);

            assertThat(result).hasSize(1);
            verify(playerRepository).findAllByIsActiveTrueOrderByNameAsc();
            verify(playerRepository, never()).findAllByOrderByNameAsc();
        }

        @Test
        @DisplayName("uses the unfiltered repository method when activeOnly=false")
        void allPlayersPath() {
            when(playerRepository.findAllByOrderByNameAsc())
                    .thenReturn(List.of(
                            samplePlayer(1L, "Alice", true),
                            samplePlayer(2L, "Bob",   false)
                    ));

            List<PlayerDTO> result = playerService.getAllPlayers(false);

            assertThat(result).hasSize(2);
            verify(playerRepository).findAllByOrderByNameAsc();
            verify(playerRepository, never()).findAllByIsActiveTrueOrderByNameAsc();
        }
    }

    @Nested
    @DisplayName("getPlayerById")
    class GetPlayerById {

        @Test
        @DisplayName("throws 404 ResponseStatusException when the id is unknown")
        void throwsWhenUnknown() {
            when(playerRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> playerService.getPlayerById(99L))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Player not found");
        }
    }

    @Nested
    @DisplayName("updatePlayer")
    class UpdatePlayer {

        @Test
        @DisplayName("does NOT touch isActive when the DTO omits it")
        void keepsActivityWhenDtoOmitsField() {
            Player existing = samplePlayer(5L, "Existing", true);
            when(playerRepository.findById(5L)).thenReturn(Optional.of(existing));
            when(playerRepository.save(any(Player.class))).thenAnswer(inv -> inv.getArgument(0));

            PlayerDTO input = PlayerDTO.builder()
                    .name("New Name")
                    .position("Defender")
                    .shirtNumber(4)
                    .build(); // no isActive

            playerService.updatePlayer(5L, input);

            assertThat(existing.getIsActive()).isTrue();
            assertThat(existing.getName()).isEqualTo("New Name");
            assertThat(existing.getPosition()).isEqualTo("Defender");
        }

        @Test
        @DisplayName("updates isActive when the DTO provides it")
        void updatesActivityWhenDtoSetsField() {
            Player existing = samplePlayer(5L, "Existing", true);
            when(playerRepository.findById(5L)).thenReturn(Optional.of(existing));
            when(playerRepository.save(any(Player.class))).thenAnswer(inv -> inv.getArgument(0));

            PlayerDTO input = PlayerDTO.builder()
                    .name("Existing")
                    .isActive(false)
                    .build();

            playerService.updatePlayer(5L, input);

            assertThat(existing.getIsActive()).isFalse();
        }
    }

    @Nested
    @DisplayName("deletePlayer (soft)")
    class DeletePlayer {

        @Test
        @DisplayName("marks an active player as inactive")
        void softDeletesActivePlayer() {
            Player existing = samplePlayer(7L, "Active", true);
            when(playerRepository.findById(7L)).thenReturn(Optional.of(existing));

            playerService.deletePlayer(7L);

            assertThat(existing.getIsActive()).isFalse();
            verify(playerRepository).save(existing);
        }

        @Test
        @DisplayName("no-op when the player is already inactive")
        void noOpWhenAlreadyInactive() {
            Player existing = samplePlayer(7L, "Inactive", false);
            when(playerRepository.findById(7L)).thenReturn(Optional.of(existing));

            playerService.deletePlayer(7L);

            verify(playerRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("activatePlayer / deactivatePlayer")
    class ToggleActivity {

        @Test
        @DisplayName("activate() sets isActive=true and saves")
        void activateSetsTrue() {
            Player existing = samplePlayer(3L, "Was inactive", false);
            when(playerRepository.findById(3L)).thenReturn(Optional.of(existing));

            playerService.activatePlayer(3L);

            assertThat(existing.getIsActive()).isTrue();
            verify(playerRepository).save(existing);
        }

        @Test
        @DisplayName("activate() is a no-op when the player is already active")
        void activateNoOpWhenAlreadyActive() {
            Player existing = samplePlayer(3L, "Active", true);
            when(playerRepository.findById(3L)).thenReturn(Optional.of(existing));

            playerService.activatePlayer(3L);

            verify(playerRepository, never()).save(any());
        }
    }
}
