package com.viitorul.app.dto;

import com.viitorul.app.entity.Team;
import lombok.Data;

@Data
public class TeamDTO {

    private Long id;
    private String name;
    private String logo;

    public static TeamDTO fromEntity(Team team) {
        if (team == null) return null;
        TeamDTO dto = new TeamDTO();
        dto.setId(team.getId());
        dto.setName(team.getName());
        dto.setLogo(team.getLogo());
        return dto;
    }

    public static Team toEntity(TeamDTO dto) {
        if (dto == null) return null;
        Team team = new Team();
        team.setId(dto.getId());
        return team;
    }


}
