package com.viitorul.app.service;

import com.viitorul.app.dto.TeamDTO;
import com.viitorul.app.entity.Team;
import com.viitorul.app.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TeamService {

    @Autowired
    private TeamRepository teamRepository;

    public List<TeamDTO> getAllTeams() {
        return teamRepository.findByActiveTrue().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public TeamDTO getTeamById(Long id) {
        Team team = teamRepository.findById(id)
                .filter(Team::isActive)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        return mapToDTO(team);
    }

    public TeamDTO createTeam(TeamDTO dto) {
        Team team = new Team();
        team.setName(dto.getName());
        team.setLogo(dto.getLogo());
        return mapToDTO(teamRepository.save(team));
    }

    public TeamDTO updateTeam(Long id, TeamDTO dto) {
        Team team = teamRepository.findById(id)
                .filter(Team::isActive)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        team.setName(dto.getName());
        team.setLogo(dto.getLogo());
        return mapToDTO(teamRepository.save(team));
    }

    public void deactivateTeam(Long id) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        team.setActive(false);
        teamRepository.save(team);
    }

    private TeamDTO mapToDTO(Team team) {
        TeamDTO dto = new TeamDTO();
        dto.setId(team.getId());
        dto.setName(team.getName());
        dto.setLogo(team.getLogo());
        return dto;
    }
}
