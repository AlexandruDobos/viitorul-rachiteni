package com.viitorul.app.api;

import com.viitorul.app.dto.TeamDTO;
import com.viitorul.app.service.TeamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/app/teams")
public class TeamController {

    @Autowired
    private TeamService teamService;

    @GetMapping
    public List<TeamDTO> getAllTeams() {
        return teamService.getAllTeams();
    }

    @GetMapping("/{id}")
    public TeamDTO getTeamById(@PathVariable("id") Long id) {
        return teamService.getTeamById(id);
    }

    @PostMapping
    public TeamDTO createTeam(@RequestBody TeamDTO dto) {
        return teamService.createTeam(dto);
    }

    @PutMapping("/{id}")
    public TeamDTO updateTeam(@PathVariable("id") Long id, @RequestBody TeamDTO dto) {
        return teamService.updateTeam(id, dto);
    }

    @DeleteMapping("/{id}")
    public void deactivateTeam(@PathVariable("id") Long id) {
        teamService.deactivateTeam(id);
    }
}
