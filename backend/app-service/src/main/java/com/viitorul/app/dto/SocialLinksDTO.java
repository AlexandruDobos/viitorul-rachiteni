package com.viitorul.app.dto;

import lombok.Data;

@Data
public class SocialLinksDTO {
    private Long id;              // intern (primul rând din tabel)
    private String facebookUrl;
    private String instagramUrl;
    private String youtubeUrl;
}
