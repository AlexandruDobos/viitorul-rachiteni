package com.viitorul.app.service;

import com.viitorul.app.config.RabbitMQConfig;
import com.viitorul.app.dto.AnnouncementDTO;
import com.viitorul.app.entity.Announcement;
import com.viitorul.app.repository.AnnouncementRepository;
import com.viitorul.common.events.AnnouncementPublishedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final RabbitTemplate rabbitTemplate;

    @Transactional
    public AnnouncementDTO createAnnouncement(AnnouncementDTO dto) {
        Announcement entity = AnnouncementDTO.toEntity(dto);

        if (entity.getPublishedAt() == null) {
            entity.setPublishedAt(OffsetDateTime.now(ZoneOffset.UTC));
        }
            entity.setSentToSubscribers(false);
        return AnnouncementDTO.fromEntity(announcementRepository.save(entity));
    }

    @Transactional(readOnly = true)
    public List<AnnouncementDTO> getAllAnnouncements() {
        return announcementRepository.findAll()
                .stream()
                .map(AnnouncementDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<AnnouncementDTO> getAnnouncementById(Long id) {
        return announcementRepository.findById(id)
                .map(AnnouncementDTO::fromEntity);
    }

    /** Paginare publică + căutare pe titlu, dar doar știri publicate până ACUM */
    @Transactional(readOnly = true)
    public Page<AnnouncementDTO> getAnnouncementsPage(int page, int size, String q) {
        Pageable pageable = PageRequest.of(page, size);
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

        Page<Announcement> result;
        if (q != null && !q.trim().isEmpty()) {
            result = announcementRepository.searchPublishedByTitle(q.trim(), now, pageable);
        } else {
            result = announcementRepository.findByPublishedAtLessThanEqualOrderByPublishedAtDesc(now, pageable);
        }
        return result.map(AnnouncementDTO::fromEntity);
    }

    // compatibilitate (fără q)
    @Transactional(readOnly = true)
    public Page<AnnouncementDTO> getAnnouncementsPage(int page, int size) {
        return getAnnouncementsPage(page, size, "");
    }

    @Transactional
    public Optional<AnnouncementDTO> updateAnnouncement(Long id, AnnouncementDTO updatedDto) {
        return announcementRepository.findById(id).map(existing -> {
            // actualizăm DOAR câmpurile editabile din existing
            if (updatedDto.getTitle() != null) {
                existing.setTitle(updatedDto.getTitle());
            }
            if (updatedDto.getCoverUrl() != null) {
                existing.setCoverUrl(updatedDto.getCoverUrl());
            }
            // contentText / contentHtml — setează în funcție de cum le folosești
            if (updatedDto.getContentText() != null) {
                existing.setContentText(updatedDto.getContentText());
            }
            if (updatedDto.getContentHtml() != null) {
                existing.setContentHtml(updatedDto.getContentHtml());
            }

            // publishedAt — dacă lipsește în DTO, îl lăsăm neschimbat
            if (updatedDto.getPublishedAt() != null) {
                existing.setPublishedAt(updatedDto.getPublishedAt());
            }


            Announcement saved = announcementRepository.save(existing);
            return AnnouncementDTO.fromEntity(saved);
        });
    }

    @Transactional
    public boolean deleteAnnouncement(Long id) {
        if (announcementRepository.existsById(id)) {
            announcementRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Scheduled(fixedDelay = 60_000L, initialDelay = 10_000L)
    @Transactional
    public void scanAndDispatchPublishedAnnouncements() {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        List<Announcement> ready = announcementRepository
                .findByPublishedAtLessThanEqualAndSentToSubscribersFalse(now);

        for (Announcement a : ready) {
            // 1) marchează ca trimis (idempotency)
            a.setSentToSubscribers(true);
            a.setSentAt(now);
            announcementRepository.save(a);

            // 2) publică evenimentul
            String raw = (a.getContentText() != null && !a.getContentText().isBlank())
                    ? a.getContentText()
                    : (a.getContentHtml() != null ? a.getContentHtml() : "");

            String excerpt = buildExcerpt(raw, 180, /*isHtml*/ a.getContentText() == null);
            String url = buildPublicUrl(a.getId(), a.getTitle());

            AnnouncementPublishedEvent ev = new AnnouncementPublishedEvent(
                    a.getId(),
                    a.getTitle(),
                    excerpt,
                    a.getCoverUrl(),
                    url
            );

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.APP_EXCHANGE,
                    RabbitMQConfig.ANN_ROUTING_KEY,
                    ev
            );
        }
    }

    private String buildExcerpt(String input, int max, boolean isHtml) {
        if (input == null) return "";
        String txt = isHtml ? stripHtml(input) : input;
        txt = txt.replaceAll("\\s+", " ").trim();
        return txt.length() <= max ? txt : txt.substring(0, Math.max(0, max - 1)) + "…";
    }

    private String stripHtml(String html) {
        return html.replaceAll("<[^>]*>", " ");
    }

    private String slugify(String s) {
        if (s == null) return "";
        String base = java.text.Normalizer.normalize(s, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        return base.length() > 80 ? base.substring(0, 80) : base;
    }

    private String buildPublicUrl(Long id, String title) {
        String slug = slugify(title == null ? "" : title);
        return String.format("https://%s/stiri/%d/%s", "viitorulrachiteni.ro", id, slug);
    }
}
