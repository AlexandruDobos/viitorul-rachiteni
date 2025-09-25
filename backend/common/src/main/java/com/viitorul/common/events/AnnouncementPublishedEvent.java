package com.viitorul.common.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor
public class AnnouncementPublishedEvent {
    private Long id;
    private String title;
    private String excerpt;   // max ~180 chars
    private String coverUrl;
    private String url;       // link public spre /stiri/{id}/{slug}
}