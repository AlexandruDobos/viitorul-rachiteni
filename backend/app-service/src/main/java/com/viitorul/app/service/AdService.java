package com.viitorul.app.service;

import com.viitorul.app.dto.AdDTO;
import com.viitorul.app.entity.Ad;
import com.viitorul.app.repository.AdRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdService {

    @Autowired
    private AdRepository adRepository;

    // ========== READ ==========
    public List<AdDTO> getAllAds(String device) {
        if (device == null || device.isBlank()) {
            // fallback: toate (nu e folosit în manager)
            return adRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
        }
        return adRepository.findAllByDeviceOrderByPositionAscOrderIndexAsc(device)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    // ========== CREATE ==========
    @Transactional
    public AdDTO addAd(AdDTO dto) {
        validate(dto);

        // setări implicite
        if (dto.getDevice() == null || dto.getDevice().isBlank()) dto.setDevice("desktop");
        if (dto.getOrderIndex() == null || dto.getOrderIndex() < 1) dto.setOrderIndex(1);

        // normalizăm indexul în grupul (position, device) și împingem ceilalți în jos
        int targetIndex = normalizeNewIndex(dto.getPosition(), dto.getDevice(), dto.getOrderIndex());
        shiftUpFrom(dto.getPosition(), dto.getDevice(), targetIndex);

        Ad ad = mapToEntity(dto);
        ad.setOrderIndex(targetIndex);
        Ad saved = adRepository.save(ad);
        return mapToDto(saved);
    }

    // ========== UPDATE ==========
    @Transactional
    public AdDTO updateAd(Long id, AdDTO dto) {
        Ad current = adRepository.findById(id).orElseThrow(() -> new RuntimeException("Reclamă inexistentă"));
        validate(dto);

        String oldPos = current.getPosition();
        String oldDev = current.getDevice();
        int oldIdx = current.getOrderIndex() == null ? 1 : current.getOrderIndex();

        String newPos = dto.getPosition() == null ? oldPos : dto.getPosition();
        String newDev = (dto.getDevice() == null || dto.getDevice().isBlank()) ? oldDev : dto.getDevice();
        int requested = (dto.getOrderIndex() == null || dto.getOrderIndex() < 1) ? 1 : dto.getOrderIndex();

        if (!oldPos.equals(newPos) || !oldDev.equals(newDev)) {
            // MUTARE în alt grup (position/device)
            // 1) închidem gaura în grupul vechi
            shiftDownFrom(oldPos, oldDev, oldIdx);

            // 2) normalizăm indexul în grupul nou și împingem de acolo
            int newIdx = normalizeNewIndex(newPos, newDev, requested);
            shiftUpFrom(newPos, newDev, newIdx);

            // 3) actualizăm
            apply(current, dto);
            current.setPosition(newPos);
            current.setDevice(newDev);
            current.setOrderIndex(newIdx);
            return mapToDto(adRepository.save(current));
        }

        // ACEEAȘI grupă (position & device) -> mutare internă
        List<Ad> group = adRepository.findAllByPositionAndDeviceOrderByOrderIndexAsc(oldPos, oldDev);
        int maxIdx = Math.max(group.size(), 1);
        int newIdx = Math.min(Math.max(requested, 1), maxIdx);

        if (newIdx < oldIdx) {
            // mutare în sus → ceilalți [newIdx..oldIdx-1] +1
            for (Ad a : group) {
                int idx = a.getOrderIndex();
                if (!a.getId().equals(current.getId()) && idx >= newIdx && idx < oldIdx) {
                    a.setOrderIndex(idx + 1);
                }
            }
            adRepository.saveAll(group);
        } else if (newIdx > oldIdx) {
            // mutare în jos → ceilalți [oldIdx+1..newIdx] -1
            for (Ad a : group) {
                int idx = a.getOrderIndex();
                if (!a.getId().equals(current.getId()) && idx <= newIdx && idx > oldIdx) {
                    a.setOrderIndex(idx - 1);
                }
            }
            adRepository.saveAll(group);
        }

        apply(current, dto);
        current.setOrderIndex(newIdx);
        return mapToDto(adRepository.save(current));
    }

    // ========== DELETE ==========
    @Transactional
    public void deleteAd(Long id) {
        Ad ad = adRepository.findById(id).orElse(null);
        if (ad == null) return;

        String pos = ad.getPosition();
        String dev = ad.getDevice();
        int idx = ad.getOrderIndex() == null ? 1 : ad.getOrderIndex();

        adRepository.deleteById(id);

        // închidem gaura în grupul lui
        shiftDownFrom(pos, dev, idx);
    }

    // ---------- helpers ----------
    private void validate(AdDTO dto) {
        if (dto.getPosition() == null || dto.getPosition().isBlank())
            throw new IllegalArgumentException("position este obligatoriu (left/right).");
        String p = dto.getPosition();
        if (!p.equals("left") && !p.equals("right"))
            throw new IllegalArgumentException("position trebuie să fie left sau right.");

        if (dto.getDevice() != null && !dto.getDevice().isBlank()) {
            String d = dto.getDevice();
            if (!d.equals("desktop") && !d.equals("mobile"))
                throw new IllegalArgumentException("device trebuie să fie desktop sau mobile.");
        }
    }

    private List<Ad> group(String position, String device) {
        return adRepository.findAllByPositionAndDeviceOrderByOrderIndexAsc(position, device);
    }

    private int normalizeNewIndex(String position, String device, Integer requested) {
        List<Ad> g = group(position, device);
        int size = g.size(); // fără noua reclamă
        int maxAllowed = size + 1; // poate fi pusă și "după ultima"
        int r = (requested == null ? maxAllowed : requested);
        if (r < 1) r = 1;
        if (r > maxAllowed) r = maxAllowed;
        return r;
    }

    // +1 pentru toți cu index >= fromIdx în acel grup
    private void shiftUpFrom(String position, String device, int fromIdx) {
        List<Ad> g = group(position, device);
        for (Ad a : g) {
            int idx = a.getOrderIndex() == null ? 1 : a.getOrderIndex();
            if (idx >= fromIdx) a.setOrderIndex(idx + 1);
        }
        adRepository.saveAll(g);
    }

    // -1 pentru toți cu index > fromIdx în acel grup
    private void shiftDownFrom(String position, String device, int fromIdx) {
        List<Ad> g = group(position, device);
        for (Ad a : g) {
            int idx = a.getOrderIndex() == null ? 1 : a.getOrderIndex();
            if (idx > fromIdx) a.setOrderIndex(idx - 1);
        }
        adRepository.saveAll(g);
    }

    private void apply(Ad target, AdDTO dto) {
        if (dto.getTitle() != null) target.setTitle(dto.getTitle());
        if (dto.getImageUrl() != null) target.setImageUrl(dto.getImageUrl());
        if (dto.getLink() != null) target.setLink(dto.getLink());
        if (dto.getPosition() != null) target.setPosition(dto.getPosition());
        if (dto.getDevice() != null) target.setDevice(dto.getDevice());
        if (dto.getStartDate() != null) target.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null) target.setEndDate(dto.getEndDate());
        // orderIndex setăm explicit în add/update
    }

    private AdDTO mapToDto(Ad ad) {
        AdDTO dto = new AdDTO();
        dto.setId(ad.getId());
        dto.setTitle(ad.getTitle());
        dto.setImageUrl(ad.getImageUrl());
        dto.setLink(ad.getLink());
        dto.setPosition(ad.getPosition());
        dto.setDevice(ad.getDevice());
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
        ad.setDevice(dto.getDevice() == null || dto.getDevice().isBlank() ? "desktop" : dto.getDevice());
        ad.setOrderIndex(dto.getOrderIndex() == null ? 1 : dto.getOrderIndex());
        ad.setStartDate(dto.getStartDate());
        ad.setEndDate(dto.getEndDate());
        return ad;
    }
}
