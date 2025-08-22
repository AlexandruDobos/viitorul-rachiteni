package com.viitorul.app.dto;

import com.viitorul.app.entity.ContactSettings;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactSettingsDTO {
    private List<String> destinationEmails;

    public static ContactSettingsDTO fromEntity(ContactSettings cs) {
        return ContactSettingsDTO.builder()
                .destinationEmails(cs.getDestinationEmails() != null ? cs.getDestinationEmails() : new ArrayList<>())
                .build();
    }

    public static ContactSettings toEntity(ContactSettingsDTO dto) {
        return ContactSettings.builder()
                .destinationEmails(dto.getDestinationEmails() != null ? dto.getDestinationEmails() : new ArrayList<>())
                .build();
    }
}
