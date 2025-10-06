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
                // 🔒 dezactivează CSRF (pentru API-uri stateless)
                .csrf(csrf -> csrf.disable())

                // 🔒 nicio sesiune - folosim doar JWT
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 🔒 reguli de acces
                .authorizeHttpRequests(auth -> auth
                        // rutele GET publice (ex. lista jucătorilor)
                        .requestMatchers(HttpMethod.GET, "/api/app/players/**").permitAll()
                        // orice altceva necesită autentificare
                        .anyRequest().authenticated()
                )

                // 🔒 adaugă filtrul tău JWT înainte de UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
