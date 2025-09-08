package com.viitorul.app.api;

import com.viitorul.app.dto.AdDTO;
import com.viitorul.app.service.AdService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/app/ads")
public class AdController {

    @Autowired
    private AdService adService;

    // filtrare pe device: /api/app/ads?device=desktop|mobile
    @GetMapping
    public List<AdDTO> getAll(@RequestParam(value = "device", required = false) String device) {
        return adService.getAllAds(device);
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
