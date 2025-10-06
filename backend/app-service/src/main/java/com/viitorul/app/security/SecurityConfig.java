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

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // --- EXCEPȚII SPECIFICE (înaintea regulilor generale) ---
                        // GET sensibil: semnare upload → doar ADMIN
                        .requestMatchers(HttpMethod.GET, "/api/app/uploads/**").hasRole("ADMIN")

                        // Formularele publice:
                        .requestMatchers(HttpMethod.POST, "/api/app/contact/messages").permitAll()

                        // Votul la meci: îl validezi tu în controller (cookie/bearer via AuthClient)
                        .requestMatchers(HttpMethod.POST, "/api/app/matches/*/vote").permitAll()
                        .requestMatchers(HttpMethod.GET,  "/api/app/matches/*/my-vote").permitAll()
                        .requestMatchers(HttpMethod.GET,  "/api/app/matches/*/votes/summary").permitAll()
                        .requestMatchers(HttpMethod.GET,  "/api/app/matches/auth/me").permitAll()

                        // --- REGULI GENERALE ---
                        // Toate GET-urile din /api/app/** sunt publice (site-ul trebuie să le consume)
                        .requestMatchers(HttpMethod.GET, "/api/app/**").permitAll()

                        // Toate scrierile din /api/app/** cer ADMIN
                        .requestMatchers(HttpMethod.POST,   "/api/app/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/app/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH,  "/api/app/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/app/**").hasRole("ADMIN")

                        // Orice altceva: autentificat
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

