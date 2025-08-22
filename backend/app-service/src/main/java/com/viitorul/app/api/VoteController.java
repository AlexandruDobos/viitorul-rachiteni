package com.viitorul.app.api;

import com.viitorul.app.auth.AuthClient;
import com.viitorul.app.auth.AuthUserInfo;
import com.viitorul.app.dto.MyVoteDTO;
import com.viitorul.app.dto.VoteRequestDTO;
import com.viitorul.app.dto.VoteSummaryDTO;
import com.viitorul.app.service.VoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/app/matches")
@RequiredArgsConstructor
public class VoteController {
    private final VoteService voteService;
    private final AuthClient authClient;

    private String resolveToken(@CookieValue(name = "jwt", required = false) String jwtCookie,
                                @RequestHeader(name = "Authorization", required = false) String authHeader) {
        if (jwtCookie != null && !jwtCookie.isBlank()) return "cookie:" + jwtCookie;
        if (authHeader != null && authHeader.startsWith("Bearer ")) return "bearer:" + authHeader.substring(7);
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
    }

    private String emailFromRequest(String tokenDescriptor) {
        if (tokenDescriptor.startsWith("cookie:")) {
            String v = tokenDescriptor.substring("cookie:".length());
            AuthUserInfo u = authClient.introspectWithCookie(v);
            return u.email();
        } else {
            String v = tokenDescriptor.substring("bearer:".length());
            AuthUserInfo u = authClient.introspectWithBearer(v);
            return u.email();
        }
    }

    @PostMapping("/{matchId}/vote")
    public ResponseEntity<Void> vote(
            @PathVariable("matchId") Long matchId,
            @RequestBody VoteRequestDTO body,
            @CookieValue(name = "jwt", required = false) String jwtCookie,
            @RequestHeader(name = "Authorization", required = false) String authHeader
    ) {
        String tokenDesc = resolveToken(jwtCookie, authHeader);
        String email = emailFromRequest(tokenDesc);
        voteService.upsertVote(matchId, body.playerId(), email);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{matchId}/my-vote")
    public ResponseEntity<MyVoteDTO> myVote(
            @PathVariable("matchId") Long matchId,
            @CookieValue(name = "jwt", required = false) String jwtCookie,
            @RequestHeader(name = "Authorization", required = false) String authHeader
    ) {
        String tokenDesc = resolveToken(jwtCookie, authHeader);
        String email = emailFromRequest(tokenDesc);
        return ResponseEntity.ok(voteService.myVote(matchId, email));
    }

    @GetMapping("/{matchId}/votes/summary")
    public ResponseEntity<VoteSummaryDTO> summary(@PathVariable("matchId") Long matchId) {
        return ResponseEntity.ok(voteService.summary(matchId));
    }

    @GetMapping("/auth/me")
    public ResponseEntity<AuthUserInfo> me(@CookieValue(name="jwt", required=false) String jwtCookie,
                                           @RequestHeader(name="Authorization", required=false) String authHeader) {
        String tokenDesc = resolveToken(jwtCookie, authHeader);
        if (tokenDesc.startsWith("cookie:")) return ResponseEntity.ok(authClient.introspectWithCookie(tokenDesc.substring(7)));
        return ResponseEntity.ok(authClient.introspectWithBearer(tokenDesc.substring(7)));
    }

}
