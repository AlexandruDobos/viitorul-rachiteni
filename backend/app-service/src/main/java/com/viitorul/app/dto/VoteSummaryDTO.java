package com.viitorul.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VoteSummaryDTO {
    private Map<Long, Long> totals;   // playerId -> votes
    private long totalVotes;
}
