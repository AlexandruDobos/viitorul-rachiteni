package com.viitorul.app.api;

import com.viitorul.app.dto.AnnouncementDTO;
import com.viitorul.app.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import java.util.List;

@RestController
@RequestMapping("/api/app/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @PostMapping
    public ResponseEntity<AnnouncementDTO> createAnnouncement(@RequestBody AnnouncementDTO dto) {
        return ResponseEntity.ok(announcementService.createAnnouncement(dto));
    }

    @GetMapping
    public ResponseEntity<List<AnnouncementDTO>> getAllAnnouncements() {
        return ResponseEntity.ok(announcementService.getAllAnnouncements());
    }

    @GetMapping("/page")
    public ResponseEntity<Page<AnnouncementDTO>> getAnnouncementsPage(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "4") int size) {
        return ResponseEntity.ok(announcementService.getAnnouncementsPage(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnnouncementDTO> getAnnouncementById(@PathVariable("id") Long id) {
        return announcementService.getAnnouncementById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<AnnouncementDTO> updateAnnouncement(@PathVariable("id") Long id,
                                                              @RequestBody AnnouncementDTO dto) {
        return announcementService.updateAnnouncement(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAnnouncement(@PathVariable("id") Long id) {
        boolean deleted = announcementService.deleteAnnouncement(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
