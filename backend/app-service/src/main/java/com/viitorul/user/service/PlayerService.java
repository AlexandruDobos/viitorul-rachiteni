package com.viitorul.user.service;

import com.viitorul.user.dto.PlayerDTO;
import com.viitorul.user.entity.Player;
import com.viitorul.user.repository.PlayerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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

}
