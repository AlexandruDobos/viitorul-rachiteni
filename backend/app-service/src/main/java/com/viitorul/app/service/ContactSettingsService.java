package com.viitorul.app.service;

import com.viitorul.app.dto.ContactSettingsDTO;
import com.viitorul.app.entity.ContactSettings;
import com.viitorul.app.repository.ContactSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContactSettingsService {

    private final ContactSettingsRepository repository;

    // Validare simplă pentru email (UI + backend safety)
    private static final Pattern EMAIL_REGEX =
            Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$", Pattern.CASE_INSENSITIVE);

    private List<String> normalizeAndValidate(List<String> emails) {
        if (emails == null) return new ArrayList<>();
        // normalizează: trim, lower, dedup & validate
        return emails.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(s -> !s.isEmpty())
                .filter(s -> EMAIL_REGEX.matcher(s).matches())
                .distinct()
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ContactSettingsDTO get() {
        ContactSettings cs = repository.findTopByOrderByIdAsc()
                .orElseGet(() -> ContactSettings.builder().destinationEmails(new ArrayList<>()).build());
        return ContactSettingsDTO.fromEntity(cs);
    }

    @Transactional
    public ContactSettingsDTO upsert(ContactSettingsDTO dto) {
        List<String> cleaned = normalizeAndValidate(dto.getDestinationEmails());

        ContactSettings cs = repository.findTopByOrderByIdAsc()
                .orElseGet(() -> ContactSettings.builder().destinationEmails(new ArrayList<>()).build());

        cs.setDestinationEmails(cleaned);
        ContactSettings saved = repository.save(cs);
        return ContactSettingsDTO.fromEntity(saved);
    }
}
