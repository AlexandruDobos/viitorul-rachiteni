package com.viitorul.app.api;

import com.viitorul.app.dto.PlayerDTO;
import com.viitorul.app.service.PlayerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/app/players")
@RequiredArgsConstructor
public class PlayerController {

    private final PlayerService playerService;

    @PostMapping
    public ResponseEntity<PlayerDTO> addPlayer(@RequestBody PlayerDTO playerDTO) {
        log.info("Add player request");
        PlayerDTO saved = playerService.addPlayer(playerDTO);
        return ResponseEntity.ok(saved);
    }

    /**
     * Implicit returnează doar jucători activi (activeOnly=true).
     * Dacă vrei toți jucătorii (inclusiv inactivi), cheamă /api/app/players?activeOnly=false
     */
    @GetMapping
    public ResponseEntity<List<PlayerDTO>> getAllPlayers(
            @RequestParam(name = "activeOnly", defaultValue = "true") boolean activeOnly
    ) {
        return ResponseEntity.ok(playerService.getAllPlayers(activeOnly));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlayerDTO> getPlayerById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(playerService.getPlayerById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlayerDTO> updatePlayer(@PathVariable("id") Long id, @RequestBody PlayerDTO playerDTO) {
        return ResponseEntity.ok(playerService.updatePlayer(id, playerDTO));
    }

    /**
     * Soft delete: marchează jucătorul ca inactiv (isActive=false).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlayer(@PathVariable("id") Long id) {
        playerService.deletePlayer(id);
        return ResponseEntity.noContent().build(); // 204
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<Void> activate(@PathVariable("id") Long id) {
        playerService.activatePlayer(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable("id") Long id) {
        playerService.deactivatePlayer(id);
        return ResponseEntity.noContent().build();
    }
}
