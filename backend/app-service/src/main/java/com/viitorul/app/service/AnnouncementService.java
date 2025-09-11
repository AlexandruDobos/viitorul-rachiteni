// backend: src/main/java/com/viitorul/app/service/AnnouncementService.java
package com.viitorul.app.service;

import com.viitorul.app.dto.AnnouncementDTO;
import com.viitorul.app.entity.Announcement;
import com.viitorul.app.repository.AnnouncementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    public AnnouncementDTO createAnnouncement(AnnouncementDTO dto) {
        Announcement entity = AnnouncementDTO.toEntity(dto);

        // fallback: dacă nu vine publishedAt, punem acum
        if (entity.getPublishedAt() == null) {
            entity.setPublishedAt(java.time.OffsetDateTime.now());
        }

        return AnnouncementDTO.fromEntity(announcementRepository.save(entity));
    }

    public List<AnnouncementDTO> getAllAnnouncements() {
        return announcementRepository.findAll()
                .stream()
                .map(AnnouncementDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public Optional<AnnouncementDTO> getAnnouncementById(Long id) {
        return announcementRepository.findById(id)
                .map(AnnouncementDTO::fromEntity);
    }

    // ✅ Noua semnătură cu q (căutare după titlu, case-insensitive)
    public Page<AnnouncementDTO> getAnnouncementsPage(int page, int size, String q) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Announcement> result;
        if (q != null && !q.trim().isEmpty()) {
            result = announcementRepository
                    .findByTitleContainingIgnoreCaseOrderByPublishedAtDesc(q.trim(), pageable);
        } else {
            result = announcementRepository
                    .findAllByOrderByPublishedAtDesc(pageable);
        }

        return result.map(AnnouncementDTO::fromEntity);
    }

    // (opțional) păstrăm și vechea semnătură pentru compatibilitate
    public Page<AnnouncementDTO> getAnnouncementsPage(int page, int size) {
        return getAnnouncementsPage(page, size, "");
    }

    public Optional<AnnouncementDTO> updateAnnouncement(Long id, AnnouncementDTO updatedDto) {
        return announcementRepository.findById(id).map(existing -> {
            Announcement updated = AnnouncementDTO.toEntity(updatedDto);
            updated.setId(id); // păstrăm ID-ul

            // păstrăm publishedAt-ul existent dacă nu vine în payload
            if (updated.getPublishedAt() == null) {
                updated.setPublishedAt(existing.getPublishedAt());
            }

            return AnnouncementDTO.fromEntity(announcementRepository.save(updated));
        });
    }

    public boolean deleteAnnouncement(Long id) {
        if (announcementRepository.existsById(id)) {
            announcementRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
