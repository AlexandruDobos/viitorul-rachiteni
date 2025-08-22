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
        log.info("Request primit!");
        PlayerDTO saved = playerService.addPlayer(playerDTO);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<PlayerDTO>> getAllPlayers() {
        return ResponseEntity.ok(playerService.getAllPlayers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlayerDTO> getPlayerById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(playerService.getPlayerById(id));
    }


}
