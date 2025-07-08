package com.viitorul.user.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
public class Match {
    @Id
    @GeneratedValue
    private Long id;
    private String homeTeam;
    private String awayTeam;

    private LocalDate date;

    private String location;         // ex: "Stadion Viitorul Răchiteni"
    private String competition;      // ex: "Liga 4 Iași", "Cupa României"
    private String season;           // ex: "2024-2025"

    private String result;           // ex: "2-1", sau poți transforma într-un obiect cu goluri proprii + adversar
    private String matchReportUrl;   // link extern cu articol / presă, dacă ai
    private String notes;            // orice alte detalii libere

    private LocalTime kickoffTime;   // ora de start (opțional)

}

