package com.viitorul.user.dto;

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
}
