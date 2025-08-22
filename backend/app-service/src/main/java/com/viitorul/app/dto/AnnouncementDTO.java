package com.viitorul.app.dto;

import com.viitorul.app.entity.Announcement;
import lombok.*;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnouncementDTO {
    private Long id;
    private String title;
    private OffsetDateTime publishedAt;
    private String coverUrl;
    private String contentHtml;
    private String contentText;

    public static AnnouncementDTO fromEntity(Announcement a) {
        if (a == null) return null;
        return AnnouncementDTO.builder()
                .id(a.getId())
                .title(a.getTitle())
                .publishedAt(a.getPublishedAt())
                .coverUrl(a.getCoverUrl())
                .contentHtml(a.getContentHtml())
                .contentText(a.getContentText())   // ✅ atenție: contentText!
                .build();
    }

    public static Announcement toEntity(AnnouncementDTO dto) {
        if (dto == null) return null;
        return Announcement.builder()
                .id(dto.getId())
                .title(dto.getTitle())
                .publishedAt(dto.getPublishedAt())
                .coverUrl(dto.getCoverUrl())
                .contentHtml(dto.getContentHtml())
                .contentText(dto.getContentText()) // ✅ atenție: contentText!
                .build();
    }
}
