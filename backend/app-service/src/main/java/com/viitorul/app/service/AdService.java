package com.viitorul.app.service;

import com.viitorul.app.dto.AdDTO;
import com.viitorul.app.entity.Ad;
import com.viitorul.app.repository.AdRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdService {

    @Autowired
    private AdRepository adRepository;

    public List<AdDTO> getAllAds() {
        return adRepository.findAllByOrderByPositionAscOrderIndexAsc()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public AdDTO addAd(AdDTO dto) {
        Ad ad = mapToEntity(dto);
        Ad saved = adRepository.save(ad);
        return mapToDto(saved);
    }

    public AdDTO updateAd(Long id, AdDTO dto) {
        Ad ad = adRepository.findById(id).orElseThrow(() -> new RuntimeException("Reclamă inexistentă"));

        ad.setTitle(dto.getTitle());
        ad.setImageUrl(dto.getImageUrl());
        ad.setLink(dto.getLink());
        ad.setPosition(dto.getPosition());
        ad.setOrderIndex(dto.getOrderIndex());
        ad.setStartDate(dto.getStartDate());
        ad.setEndDate(dto.getEndDate());

        Ad updated = adRepository.save(ad);
        return mapToDto(updated);
    }


    public void deleteAd(Long id) {
        adRepository.deleteById(id);
    }

    private AdDTO mapToDto(Ad ad) {
        AdDTO dto = new AdDTO();
        dto.setId(ad.getId());
        dto.setTitle(ad.getTitle());
        dto.setImageUrl(ad.getImageUrl());
        dto.setLink(ad.getLink());
        dto.setPosition(ad.getPosition());
        dto.setOrderIndex(ad.getOrderIndex());
        dto.setStartDate(ad.getStartDate());
        dto.setEndDate(ad.getEndDate());
        return dto;
    }

    private Ad mapToEntity(AdDTO dto) {
        Ad ad = new Ad();
        ad.setId(dto.getId());
        ad.setTitle(dto.getTitle());
        ad.setImageUrl(dto.getImageUrl());
        ad.setLink(dto.getLink());
        ad.setPosition(dto.getPosition());
        ad.setOrderIndex(dto.getOrderIndex());
        ad.setStartDate(dto.getStartDate());
        ad.setEndDate(dto.getEndDate());
        return ad;
    }
}
