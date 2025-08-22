package com.viitorul.app.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScrapeRequestDTO {
    @NotBlank
    private String url;
}
