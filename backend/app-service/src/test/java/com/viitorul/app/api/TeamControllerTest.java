package com.viitorul.app.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.viitorul.app.dto.TeamDTO;
import com.viitorul.app.service.TeamService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * HTTP contract tests for {@link TeamController}.
 *
 * We deliberately avoid {@code @WebMvcTest} here: the app-service module has
 * several {@code @Component} filter beans ({@code JwtAuthFilter},
 * {@code SharePreviewFilter}) that Spring auto-picks-up and whose transitive
 * dependencies (repositories, JWT utils) drag the entire application context
 * into the test. That makes @WebMvcTest slow and brittle for a controller
 * that only needs Jackson + MockMvc.
 *
 * Instead we build a "standalone" MockMvc around the controller with a
 * Mockito-mocked service. The result:
 *   - milliseconds per test,
 *   - zero coupling to security or repository configuration,
 *   - identical URL routing / JSON serialization to production.
 *
 * Trade-off: filters (auth, CORS) and global @ControllerAdvice are NOT wired
 * up. Cover those in dedicated security / integration tests.
 */
@ExtendWith(MockitoExtension.class)
class TeamControllerTest {

    @Mock
    private TeamService teamService;

    @InjectMocks
    private TeamController teamController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(teamController).build();
        objectMapper = new ObjectMapper();
    }

    private TeamDTO dto(long id, String name) {
        TeamDTO t = new TeamDTO();
        t.setId(id);
        t.setName(name);
        t.setLogo("logo-" + id + ".png");
        return t;
    }

    @Test
    @DisplayName("GET /api/app/teams returns 200 with the list of teams")
    void getAllTeams_returns200() throws Exception {
        when(teamService.getAllTeams()).thenReturn(List.of(
                dto(1L, "Viitorul"),
                dto(2L, "Biruința")
        ));

        mockMvc.perform(get("/api/app/teams"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Viitorul"))
                .andExpect(jsonPath("$[1].name").value("Biruința"));
    }

    @Test
    @DisplayName("GET /api/app/teams/{id} returns 200 with a single team")
    void getTeamById_returns200() throws Exception {
        when(teamService.getTeamById(42L)).thenReturn(dto(42L, "Viitorul"));

        mockMvc.perform(get("/api/app/teams/{id}", 42L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(42))
                .andExpect(jsonPath("$.name").value("Viitorul"))
                .andExpect(jsonPath("$.logo").value("logo-42.png"));
    }

    @Test
    @DisplayName("POST /api/app/teams accepts JSON body and returns the created team")
    void createTeam_returns200WithBody() throws Exception {
        TeamDTO input = new TeamDTO();
        input.setName("New Team");
        input.setLogo("new.png");

        when(teamService.createTeam(any(TeamDTO.class))).thenReturn(dto(99L, "New Team"));

        mockMvc.perform(post("/api/app/teams")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(99));
    }

    @Test
    @DisplayName("DELETE /api/app/teams/{id} returns 200 (soft deactivation)")
    void deactivateTeam_returns200() throws Exception {
        mockMvc.perform(delete("/api/app/teams/{id}", 3L))
                .andExpect(status().isOk());
    }
}
