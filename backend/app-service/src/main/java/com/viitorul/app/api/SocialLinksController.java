package com.viitorul.app.api;

import com.viitorul.app.dto.SocialLinksDTO;
import com.viitorul.app.service.SocialLinksService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/app/social")
@RequiredArgsConstructor
public class SocialLinksController {

    private final SocialLinksService service;

    @GetMapping
    public SocialLinksDTO get() {
        return service.get();
    }

    @PutMapping
    public SocialLinksDTO upsert(@RequestBody SocialLinksDTO dto) {
        return service.save(dto);
    }
}
