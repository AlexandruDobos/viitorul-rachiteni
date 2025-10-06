package com.viitorul.app.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> {}) // ✅ activează CORS (vezi bean-ul de mai jos)
                .csrf(csrf -> csrf.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // ✅ preflight CORS

                        // --- EXCEPȚII SPECIFICE ---
                        .requestMatchers(HttpMethod.GET, "/api/app/uploads/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/app/contact/messages").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/app/matches/*/vote").permitAll()
                        .requestMatchers(HttpMethod.GET,  "/api/app/matches/*/my-vote").permitAll()
                        .requestMatchers(HttpMethod.GET,  "/api/app/matches/*/votes/summary").permitAll()
                        .requestMatchers(HttpMethod.GET,  "/api/app/matches/auth/me").permitAll()

                        // --- REGULI GENERALE ---
                        .requestMatchers(HttpMethod.GET, "/api/app/**").permitAll()
                        .requestMatchers(HttpMethod.POST,   "/api/app/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/app/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH,  "/api/app/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/app/**").hasRole("ADMIN")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ✅ CORS cu credențiale pentru domeniul frontend-ului
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        var c = new CorsConfiguration();
        c.setAllowedOrigins(List.of("https://www.viitorulrachiteni.ro"));
        c.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        c.setAllowedHeaders(List.of("Content-Type","Authorization")); // Authorization e ok să rămână
        c.setAllowCredentials(true); // necesar pentru cookie

        var s = new UrlBasedCorsConfigurationSource();
        s.registerCorsConfiguration("/**", c);
        return s;
    }
}
