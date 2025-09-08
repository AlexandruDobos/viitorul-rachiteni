package com.viitorul.app.service;

import com.viitorul.app.dto.AdDTO;
import com.viitorul.app.entity.Ad;
import com.viitorul.app.entity.DeviceType;
import com.viitorul.app.repository.AdRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdService {

    private final AdRepository adRepository;

    public List<AdDTO> getAllAds(DeviceType deviceType) {
        return adRepository.findAllByDeviceTypeOrderByPositionAscOrderIndexAsc(deviceType)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public AdDTO addAd(AdDTO dto) {
        DeviceType device = dto.getDeviceType() == null ? DeviceType.LAPTOP : dto.getDeviceType();
        String pos = dto.getPosition();

        int max = adRepository.maxIndexInBucket(pos, device);
        int target = Math.max(1, Math.min(nullSafe(dto.getOrderIndex(), 1), max + 1));

        // 1) fă loc
        adRepository.shiftRightFrom(pos, device, target);

        // 2) salvează
        Ad ad = mapToEntity(dto);
        ad.setDeviceType(device);
        ad.setOrderIndex(target);

        return mapToDto(adRepository.save(ad));
    }

    @Transactional
    public AdDTO updateAd(Long id, AdDTO dto) {
        Ad ad = adRepository.findById(id).orElseThrow(() -> new RuntimeException("Reclamă inexistentă"));

        String oldPos = ad.getPosition();
        DeviceType oldDev = ad.getDeviceType();
        int oldIdx = nullSafe(ad.getOrderIndex(), 1);

        String newPos = dto.getPosition();
        DeviceType newDev = dto.getDeviceType() == null ? oldDev : dto.getDeviceType();
        int reqIdx = nullSafe(dto.getOrderIndex(), oldIdx);

        boolean bucketChanged = !Objects.equals(oldPos, newPos) || oldDev != newDev;
        if (bucketChanged) {
            // neutralizez în bucketul vechi ca să evit coliziuni de unicitate
            ad.setOrderIndex(0);
            adRepository.saveAndFlush(ad);

            // fac loc în bucketul nou
            int maxNew = adRepository.maxIndexInBucket(newPos, newDev);
            int target = Math.max(1, Math.min(reqIdx, maxNew + 1));
            adRepository.shiftRightFrom(newPos, newDev, target);

            // mut anunțul în noul bucket + indexul țintă
            ad.setPosition(newPos);
            ad.setDeviceType(newDev);
            ad.setTitle(dto.getTitle());
            ad.setImageUrl(dto.getImageUrl());
            ad.setLink(dto.getLink());
            ad.setStartDate(dto.getStartDate());
            ad.setEndDate(dto.getEndDate());
            ad.setOrderIndex(target);

            // compactează bucketul vechi (după indexul eliberat)
            adRepository.compactAfter(oldPos, oldDev, oldIdx);

            return mapToDto(adRepository.save(ad));
        }

        // același bucket: re-ordonare fără să rup unicitatea
        int max = adRepository.maxIndexInBucket(oldPos, oldDev);
        int newIdx = Math.max(1, Math.min(reqIdx, Math.max(max, 1)));

        if (newIdx != oldIdx) {
            // 1) neutralizez anunțul mutat -> eliberează poziția „veche”
            ad.setOrderIndex(0);
            adRepository.saveAndFlush(ad);

            // 2) deplasez ceilalți
            if (newIdx < oldIdx) {
                adRepository.bumpUpBetween(oldPos, oldDev, newIdx, oldIdx - 1, ad.getId());
            } else {
                adRepository.bumpDownBetween(oldPos, oldDev, oldIdx + 1, newIdx, ad.getId());
            }

            // 3) setez noul index pentru anunțul mutat
            ad.setOrderIndex(newIdx);
        }

        // actualizez restul câmpurilor
        ad.setTitle(dto.getTitle());
        ad.setImageUrl(dto.getImageUrl());
        ad.setLink(dto.getLink());
        ad.setStartDate(dto.getStartDate());
        ad.setEndDate(dto.getEndDate());

        return mapToDto(adRepository.save(ad));
    }

    @Transactional
    public void deleteAd(Long id) {
        Ad ad = adRepository.findById(id).orElse(null);
        if (ad == null) return;

        String pos = ad.getPosition();
        DeviceType dev = ad.getDeviceType();
        int idx = nullSafe(ad.getOrderIndex(), 1);

        adRepository.deleteById(id);
        adRepository.compactAfter(pos, dev, idx);
    }

    // ---- mapping

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
        dto.setDeviceType(ad.getDeviceType());
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
        ad.setDeviceType(dto.getDeviceType() == null ? DeviceType.LAPTOP : dto.getDeviceType());
        return ad;
    }

    private int nullSafe(Integer v, int def) {
        return v == null ? def : v;
    }
}
