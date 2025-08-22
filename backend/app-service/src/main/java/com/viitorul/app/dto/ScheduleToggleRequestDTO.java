package com.viitorul.app.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleToggleRequestDTO {
    @NotNull
    private Boolean enabled;
}
