package com.viitorul.email_service.dto;

import lombok.Data;

@Data
public class BroadcastEmailRequest {
    private String title;   // subiect + H1
    private String html;    // conținut HTML (din editorul din admin)
}