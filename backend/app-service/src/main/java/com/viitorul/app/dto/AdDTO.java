package com.viitorul.app.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class AdDTO {
    private Long id;
    private String title;
    private String imageUrl;
    private String link;
    private String position;     // left / right
    private Integer orderIndex;  // 1..N
    private String deviceType;   // "LAPTOP" | "MOBILE" (case-insensitive acceptat în service)
    private LocalDate startDate;
    private LocalDate endDate;
}
