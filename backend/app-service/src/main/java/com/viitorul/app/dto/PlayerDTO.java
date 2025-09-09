package com.viitorul.app.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.viitorul.app.entity.Player;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PlayerDTO {
    private Long id;
    private String name;
    private String position;
    private Integer shirtNumber;
    private String profileImageUrl;

    @JsonProperty("isActive")
    private Boolean isActive;

    public static PlayerDTO toDto(Player player) {
        return PlayerDTO.builder()
                .id(player.getId())
                .name(player.getName())
                .position(player.getPosition())
                .shirtNumber(player.getShirtNumber())
                .profileImageUrl(player.getProfileImageUrl())
                .isActive(player.getIsActive())
                .build();
    }
}
