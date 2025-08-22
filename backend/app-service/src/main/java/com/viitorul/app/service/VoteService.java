package com.viitorul.app.service;

import com.viitorul.app.dto.MyVoteDTO;
import com.viitorul.app.dto.VoteSummaryDTO;
import com.viitorul.app.entity.Match;
import com.viitorul.app.entity.MatchMvpVote;
import com.viitorul.app.entity.Player;
import com.viitorul.app.repository.MatchMvpVoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;

@Service
@RequiredArgsConstructor
public class VoteService {

    private final MatchMvpVoteRepository repo;
    private final MatchService matchService;
    private final PlayerService playerService;

    /** Verifică: meci finalizat + jucător în [titulari ∪ rezerve] */
    private void validateBallot(Match match, Long playerId) {
        boolean finished = match.getHomeGoals() != null && match.getAwayGoals() != null;
        if (!finished) {
            throw new ResponseStatusException(BAD_REQUEST, "Voting allowed only after full-time.");
        }

        List<Player> starters   = Optional.ofNullable(match.getStartingPlayers()).orElse(List.of());
        List<Player> substitutes = Optional.ofNullable(match.getSubstitutePlayers()).orElse(List.of());

        boolean inStarters   = containsPlayerId(starters, playerId);
        boolean inSubstitutes = containsPlayerId(substitutes, playerId);

        if (!(inStarters || inSubstitutes)) {
            throw new ResponseStatusException(BAD_REQUEST, "Player not in match squad.");
        }
    }

    private boolean containsPlayerId(List<Player> players, Long playerId) {
        if (playerId == null) return false;
        for (Player p : players) {
            if (p != null && p.getId() != null && p.getId().equals(playerId)) {
                return true;
            }
        }
        return false;
    }

    /** Creează/înlocuiește votul utilizatorului pentru un meci. */
    public void upsertVote(Long matchId, Long playerId, String userEmail) {
        if (playerId == null) {
            throw new ResponseStatusException(BAD_REQUEST, "playerId is required.");
        }
        if (userEmail == null || userEmail.isBlank()) {
            throw new ResponseStatusException(CONFLICT, "Missing voter identity.");
        }

        Match match = matchService.getMatchEntity(matchId);      // vezi notele de mai jos
        validateBallot(match, playerId);

        Player player = playerService.getPlayerEntity(playerId); // vezi notele de mai jos

        var existing = repo.findByMatchIdAndUserEmail(matchId, userEmail).orElse(null);
        if (existing == null) {
            repo.save(MatchMvpVote.builder()
                    .match(match)
                    .player(player)
                    .userEmail(userEmail)
                    .build());
        } else {
            existing.setPlayer(player); // “schimbă votul”
            repo.save(existing);
        }
    }

    /** Votul meu pentru meciul X. */
    public MyVoteDTO myVote(Long matchId, String email) {
        if (email == null || email.isBlank()) {
            return new MyVoteDTO(null);
        }
        return repo.findByMatchIdAndUserEmail(matchId, email)
                .map(v -> new MyVoteDTO(v.getPlayer().getId()))
                .orElse(new MyVoteDTO(null));
    }

    /** Sumar voturi: playerId → count, plus total. */
    public VoteSummaryDTO summary(Long matchId) {
        List<Object[]> rows = repo.countByPlayer(matchId);
        Map<Long, Long> totals = new HashMap<>();
        for (Object[] r : rows) {
            Long pid = ((Number) r[0]).longValue();
            Long cnt = ((Number) r[1]).longValue();
            totals.put(pid, cnt);
        }
        long total = repo.countByMatchId(matchId);
        return new VoteSummaryDTO(totals, total);
    }
}
