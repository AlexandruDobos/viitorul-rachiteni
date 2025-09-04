package com.viitorul.app.api;

import com.viitorul.app.service.R2Signer;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URL;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/app/uploads")
@RequiredArgsConstructor
public class UploadController {

    private final R2Signer signer;

    // GET /api/uploads/sign?folder=announcements&filename=poză.jpg&contentType=image/jpeg
    @GetMapping("/sign")
    public ResponseEntity<Map<String, String>> signUpload(
            @RequestParam String filename,
            @RequestParam String contentType,
            @RequestParam(defaultValue = "announcements") String folder
    ) {
        String safeName = filename.replaceAll("[^a-zA-Z0-9._-]", "_");
        String key = folder + "/" + UUID.randomUUID() + "-" + safeName;

        URL uploadUrl = signer.presignPut(key, contentType, Duration.ofMinutes(10));
        String publicUrl = signer.publicUrl(key);

        return ResponseEntity.ok(Map.of(
                "uploadUrl", uploadUrl.toString(),
                "publicUrl", publicUrl,
                "key", key
        ));
    }
}
