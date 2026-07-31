package com.viitorul.app.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@Configuration
@EnableWebSecurity
@Profile("dev") // 👈 SE VA ACTIVA DOAR PE LOCAL
public class LocalSecurityConfig {

    @Bean
    public SecurityFilterChain localFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(localCorsSource()))
            .csrf(csrf -> csrf.disable())
            .httpBasic(hb -> hb.disable()) // Dezactivează popup-ul nativ din browser
            .formLogin(fl -> fl.disable())
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()  // 👈 PERMITE ABSOLUT ORICE RUTĂ FĂRĂ LOGIN
            );
        return http.build();
    }

    @Bean
    public CorsConfigurationSource localCorsSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowCredentials(true);
        cfg.setAllowedOriginPatterns(List.of("http://localhost:5173"));
        cfg.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        
        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", cfg); // Aplică CORS global pe local
        return src;
    }
}
