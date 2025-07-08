package com.viitorul.user.api;

import com.viitorul.user.dto.PlayerDTO;
import com.viitorul.user.entity.Player;
import com.viitorul.user.service.PlayerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@Slf4j
@RestController
@RequestMapping("/api/app")
@RequiredArgsConstructor
public class PlayerController {

    private final PlayerService playerService;

    @PostMapping("/players")
    public ResponseEntity<PlayerDTO> addPlayer(@RequestBody PlayerDTO playerDTO) {
        log.info("Request primit!");
        PlayerDTO saved = playerService.addPlayer(playerDTO);
        return ResponseEntity.ok(saved);
    }


    @GetMapping("/players")
    public ResponseEntity<List<PlayerDTO>> getAllPlayers() {
        return ResponseEntity.ok(playerService.getAllPlayers());
    }
}
