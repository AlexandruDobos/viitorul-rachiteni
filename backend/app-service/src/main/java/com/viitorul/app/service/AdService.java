package com.viitorul.app.service;

import com.viitorul.app.dto.AdDTO;
import com.viitorul.app.entity.Ad;
import com.viitorul.app.entity.Ad.DeviceType;
import com.viitorul.app.repository.AdRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdService {

    private final AdRepository adRepository;

    // ==== LISTARE ====
    public List<AdDTO> getAllAds(String device, String position) {
        DeviceType dev = parseDevice(device); // poate fi null => toate
        var list = adRepository.findAllSorted(position, dev);
        return list.stream().map(this::toDto).collect(Collectors.toList());
    }

    // ==== CREATE ====
    @Transactional
    public AdDTO addAd(AdDTO dto) {
        DeviceType device = parseDevice(dto.getDeviceType());
        if (device == null) device = DeviceType.LAPTOP;

        String position = dto.getPosition();
        int newIndex = safeIndex(dto.getOrderIndex());

        int max = adRepository.maxOrderInBucket(position, device);
        if (newIndex > max + 1) newIndex = max + 1;

        // facem loc în bucket
        adRepository.makeRoomFrom(position, device, newIndex);

        Ad ad = toEntity(dto);
        ad.setDeviceType(device);
        ad.setOrderIndex(newIndex);

        Ad saved = adRepository.save(ad);
        return toDto(saved);
    }

    // ==== UPDATE (re-ordonare atomică) ====
    @Transactional
    public AdDTO updateAd(Long id, AdDTO dto) {
        Ad ad = adRepository.findById(id).orElseThrow(() -> new RuntimeException("Reclamă inexistentă"));

        String oldPos = ad.getPosition();
        DeviceType oldDev = ad.getDeviceType();
        int oldIndex = ad.getOrderIndex();

        String newPos = dto.getPosition();
        DeviceType newDev = parseDevice(dto.getDeviceType());
        if (newDev == null) newDev = DeviceType.LAPTOP;

        int requestedIndex = safeIndex(dto.getOrderIndex());

        // normalizăm newIndex în bucketul țintă
        int targetMax = adRepository.maxOrderInBucket(newPos, newDev);
        int newIndex = Math.min(Math.max(requestedIndex, 1), targetMax + (isSameBucket(oldPos, oldDev, newPos, newDev) ? 0 : 1));

        if (isSameBucket(oldPos, oldDev, newPos, newDev)) {
            // aceeași găleată => shift între limite
            if (newIndex < oldIndex) {
                adRepository.bumpUpBetween(oldPos, oldDev, newIndex, oldIndex - 1, ad.getId());
            } else if (newIndex > oldIndex) {
                adRepository.bumpDownBetween(oldPos, oldDev, oldIndex + 1, newIndex, ad.getId());
            }
        } else {
            // altă găleată => închidem gaura în vechiul bucket, facem loc în noul bucket
            adRepository.compactAfter(oldPos, oldDev, oldIndex);
            // recalculăm max după compactare în bucketul nou (nu se schimbă dar păstrăm claritatea)
            int maxInNew = adRepository.maxOrderInBucket(newPos, newDev);
            if (newIndex > maxInNew + 1) newIndex = maxInNew + 1;
            adRepository.makeRoomFrom(newPos, newDev, newIndex);
        }

        // update efectiv
        ad.setTitle(dto.getTitle());
        ad.setImageUrl(dto.getImageUrl());
        ad.setLink(dto.getLink());
        ad.setPosition(newPos);
        ad.setDeviceType(newDev);
        ad.setOrderIndex(newIndex);
        ad.setStartDate(dto.getStartDate());
        ad.setEndDate(dto.getEndDate());

        Ad saved = adRepository.save(ad);
        return toDto(saved);
    }

    // ==== DELETE (compactare) ====
    @Transactional
    public void deleteAd(Long id) {
        Ad ad = adRepository.findById(id).orElse(null);
        if (ad == null) return;

        String pos = ad.getPosition();
        DeviceType dev = ad.getDeviceType();
        int idx = ad.getOrderIndex();

        adRepository.deleteById(id);
        adRepository.compactAfter(pos, dev, idx);
    }

    // ==== Helpers ====
    private boolean isSameBucket(String p1, DeviceType d1, String p2, DeviceType d2) {
        return p1.equals(p2) && d1 == d2;
    }

    private int safeIndex(Integer i) {
        return (i == null || i < 1) ? 1 : i;
    }

    private DeviceType parseDevice(String text) {
        if (text == null || text.isBlank()) return null;
        String s = text.trim().toUpperCase(Locale.ROOT);
        if (s.equals("LAPTOP")) return DeviceType.LAPTOP;
        if (s.equals("MOBILE") || s.equals("PHONE") || s.equals("MOBIL") || s.equals("TELEFON")) return DeviceType.MOBILE;
        return null;
    }

    private AdDTO toDto(Ad ad) {
        AdDTO dto = new AdDTO();
        dto.setId(ad.getId());
        dto.setTitle(ad.getTitle());
        dto.setImageUrl(ad.getImageUrl());
        dto.setLink(ad.getLink());
        dto.setPosition(ad.getPosition());
        dto.setOrderIndex(ad.getOrderIndex());
        dto.setDeviceType(ad.getDeviceType().name());
        dto.setStartDate(ad.getStartDate());
        dto.setEndDate(ad.getEndDate());
        return dto;
    }

    private Ad toEntity(AdDTO dto) {
        Ad ad = new Ad();
        ad.setId(dto.getId());
        ad.setTitle(dto.getTitle());
        ad.setImageUrl(dto.getImageUrl());
        ad.setLink(dto.getLink());
        ad.setPosition(dto.getPosition());
        ad.setOrderIndex(safeIndex(dto.getOrderIndex()));
        ad.setStartDate(dto.getStartDate());
        ad.setEndDate(dto.getEndDate());
        ad.setDeviceType(parseDevice(dto.getDeviceType()) == null ? DeviceType.LAPTOP : parseDevice(dto.getDeviceType()));
        return ad;
    }
}
