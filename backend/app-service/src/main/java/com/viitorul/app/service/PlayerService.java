package com.viitorul.app.service;

import com.viitorul.app.dto.PlayerDTO;
import com.viitorul.app.entity.Player;
import com.viitorul.app.repository.PlayerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;


@Service
@RequiredArgsConstructor
public class PlayerService {

    private final PlayerRepository playerRepository;
    public PlayerDTO addPlayer(PlayerDTO dto) {
        Player player = Player.builder()
                .name(dto.getName())
                .position(dto.getPosition())
                .shirtNumber(dto.getShirtNumber())
                .profileImageUrl(dto.getProfileImageUrl())
                .build();

        Player saved = playerRepository.save(player);

        return PlayerDTO.builder()
                .id(saved.getId())
                .name(saved.getName())
                .position(saved.getPosition())
                .shirtNumber(saved.getShirtNumber())
                .profileImageUrl(saved.getProfileImageUrl())
                .build();
    }


    public List<PlayerDTO> getAllPlayers() {
        return playerRepository.findAll().stream()
                .map(player -> PlayerDTO.builder()
                        .id(player.getId())
                        .name(player.getName())
                        .position(player.getPosition())
                        .shirtNumber(player.getShirtNumber())
                        .profileImageUrl(player.getProfileImageUrl())
                        .build())
                .toList();
    }

    public PlayerDTO getPlayerById(Long id) {
        Player player = playerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Player not found with ID: " + id));
        return PlayerDTO.toDto(player);
    }

    public Player getPlayerEntity(Long id) {
        return playerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Player not found"));
    }

    public PlayerDTO updatePlayer(Long id, PlayerDTO dto) {
        Player p = playerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Player not found"));
        p.setName(dto.getName());
        p.setPosition(dto.getPosition());
        p.setShirtNumber(dto.getShirtNumber());
        p.setProfileImageUrl(dto.getProfileImageUrl());
        return PlayerDTO.toDto(playerRepository.save(p));
    }

    public void deletePlayer(Long id) {
        if (!playerRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Player not found");
        }
        playerRepository.deleteById(id);
    }
}
