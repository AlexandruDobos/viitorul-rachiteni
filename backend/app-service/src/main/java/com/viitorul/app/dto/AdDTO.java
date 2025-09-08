package com.viitorul.app.dto;

import com.viitorul.app.entity.DeviceType;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AdDTO {
    private Long id;
    private String title;
    private String imageUrl;
    private String link;
    private String position;     // left / right
    private Integer orderIndex;
    private LocalDate startDate;
    private LocalDate endDate;
    private DeviceType deviceType; // LAPTOP / MOBILE
}
