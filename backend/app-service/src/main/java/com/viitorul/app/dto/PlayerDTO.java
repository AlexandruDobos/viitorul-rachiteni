package com.viitorul.app.dto;

import com.viitorul.app.entity.Player;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlayerDTO {
    private Long id;
    private String name;
    private String position;
    private Integer shirtNumber;
    private String profileImageUrl;

    public static PlayerDTO toDto(Player player) {
        return PlayerDTO.builder()
                .id(player.getId())
                .name(player.getName())
                .position(player.getPosition())
                .shirtNumber(player.getShirtNumber())
                .profileImageUrl(player.getProfileImageUrl())
                .build();
    }
}
