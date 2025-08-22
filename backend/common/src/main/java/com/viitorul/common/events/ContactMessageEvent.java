package com.viitorul.common.events;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactMessageEvent {
    private List<String> to;
    private String subject;
    private String html;
    private String text;
    private String from; // optional
}
