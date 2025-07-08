package com.viitorul.user.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchDTO {
    private Long id;
    private String homeTeam;
    private String awayTeam;

    private LocalDate date;
    private String location;
    private String competition;
    private String season;

    private String result;
    private String matchReportUrl;
    private String notes;

    private LocalTime kickoffTime;
}
