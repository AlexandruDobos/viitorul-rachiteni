package com.viitorul.app.api;

import com.viitorul.app.dto.AdDTO;
import com.viitorul.app.entity.DeviceType;
import com.viitorul.app.service.AdService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/app/ads")
@RequiredArgsConstructor
public class AdController {

    private final AdService adService;

    @GetMapping
    public List<AdDTO> getAll(@RequestParam(name = "device", required = false) String device) {
        DeviceType dev;
        try {
            dev = device == null ? DeviceType.LAPTOP : DeviceType.valueOf(device.toUpperCase());
        } catch (IllegalArgumentException ex) {
            dev = DeviceType.LAPTOP;
        }
        return adService.getAllAds(dev);
    }

    @PostMapping
    public AdDTO create(@RequestBody AdDTO dto) {
        return adService.addAd(dto);
    }

    @PutMapping("/{id}")
    public AdDTO update(@PathVariable("id") Long id, @RequestBody AdDTO dto) {
        return adService.updateAd(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable("id") Long id) {
        adService.deleteAd(id);
    }
}
