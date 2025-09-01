package com.viitorul.app.service;

import com.viitorul.app.dto.SocialLinksDTO;
import com.viitorul.app.entity.SocialLinks;
import com.viitorul.app.repository.SocialLinksRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SocialLinksService {

    private final SocialLinksRepository repo;

    /** Returnează rândul existent sau creează unul gol. */
    @Transactional
    protected SocialLinks ensureRow() {
        return repo.findFirstByOrderByIdAsc()
                .orElseGet(() -> repo.save(new SocialLinks()));
    }

    @Transactional(readOnly = true)
    public SocialLinksDTO get() {
        return repo.findFirstByOrderByIdAsc()
                .map(this::toDto)
                .orElse(new SocialLinksDTO());
    }


    @Transactional
    public SocialLinksDTO save(SocialLinksDTO dto) {
        SocialLinks e = ensureRow();
        e.setFacebookUrl(dto.getFacebookUrl());
        e.setInstagramUrl(dto.getInstagramUrl());
        e.setYoutubeUrl(dto.getYoutubeUrl());
        return toDto(repo.save(e));
    }

    private SocialLinksDTO toDto(SocialLinks e) {
        SocialLinksDTO dto = new SocialLinksDTO();
        dto.setId(e.getId());
        dto.setFacebookUrl(e.getFacebookUrl());
        dto.setInstagramUrl(e.getInstagramUrl());
        dto.setYoutubeUrl(e.getYoutubeUrl());
        return dto;
    }
}
