package com.viitorul.app.service;

import com.viitorul.app.dto.PlayerDTO;
import com.viitorul.app.entity.Player;
import com.viitorul.app.repository.PlayerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
                .isActive(dto.getIsActive() == null ? true : dto.getIsActive())
                .build();

        Player saved = playerRepository.save(player);
        return PlayerDTO.toDto(saved);
    }

    /**
     * @param activeOnly dacă true (implicit), întoarce doar jucătorii activi; dacă false, îi întoarce pe toți
     */
    public List<PlayerDTO> getAllPlayers(boolean activeOnly) {
        List<Player> list = activeOnly
                ? playerRepository.findAllByIsActiveTrueOrderByNameAsc()
                : playerRepository.findAllByOrderByNameAsc();

        return list.stream().map(PlayerDTO::toDto).toList();
    }

    public PlayerDTO getPlayerById(Long id) {
        Player player = playerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Player not found with ID: " + id));
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

        // dacă în DTO vine explicit isActive, îl aplicăm; altfel nu-l modificăm
        if (dto.getIsActive() != null) {
            p.setIsActive(dto.getIsActive());
        }

        return PlayerDTO.toDto(playerRepository.save(p));
    }

    /** Soft delete: dezactivează jucătorul în loc să-l șteargă fizic. */
    public void deletePlayer(Long id) {
        Player p = playerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Player not found"));
        if (Boolean.FALSE.equals(p.getIsActive())) {
            // deja inactiv – nu e eroare, dar nu mai avem ce face
            return;
        }
        p.setIsActive(false);
        playerRepository.save(p);
    }

    public void activatePlayer(Long id) {
        Player p = playerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Player not found"));
        if (Boolean.TRUE.equals(p.getIsActive())) return;
        p.setIsActive(true);
        playerRepository.save(p);
    }

    public void deactivatePlayer(Long id) {
        Player p = playerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Player not found"));
        if (Boolean.FALSE.equals(p.getIsActive())) return;
        p.setIsActive(false);
        playerRepository.save(p);
    }
}
