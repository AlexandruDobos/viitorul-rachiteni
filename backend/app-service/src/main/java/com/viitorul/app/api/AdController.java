package com.viitorul.app.api;

import com.viitorul.app.dto.AdDTO;
import com.viitorul.app.service.AdService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/app/ads")
@RequiredArgsConstructor
public class AdController {

    private final AdService adService;

    // GET /api/app/ads?device=LAPTOP&position=left
    @GetMapping
    public List<AdDTO> getAll(@RequestParam(required = false) String device,
                              @RequestParam(required = false) String position) {
        return adService.getAllAds(device, position);
    }

    @PostMapping
    public AdDTO create(@RequestBody AdDTO dto) {
        return adService.addAd(dto);
    }

    @PutMapping("/{id}")
    public AdDTO update(@PathVariable Long id, @RequestBody AdDTO dto) {
        return adService.updateAd(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        adService.deleteAd(id);
    }
}
