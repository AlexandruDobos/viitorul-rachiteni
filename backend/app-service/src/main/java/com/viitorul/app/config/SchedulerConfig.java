package com.viitorul.app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
public class SchedulerConfig {
    // Nimic în plus aici. @EnableScheduling pornește schedulerul Spring.
}
