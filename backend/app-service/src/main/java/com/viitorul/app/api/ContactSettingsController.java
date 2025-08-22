package com.viitorul.app.api;

import com.viitorul.app.dto.ContactSettingsDTO;
import com.viitorul.app.service.ContactSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/app/contact-settings")
@RequiredArgsConstructor
public class ContactSettingsController {

    private final ContactSettingsService service;

    @GetMapping
    public ResponseEntity<ContactSettingsDTO> get() {
        // Returnăm mereu 200 cu listă (poate fi goală)
        return ResponseEntity.ok(service.get());
    }

    @PutMapping
    public ResponseEntity<ContactSettingsDTO> upsert(@RequestBody ContactSettingsDTO dto) {
        return ResponseEntity.ok(service.upsert(dto));
    }
}
