package com.viitorul.auth.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String name;
    private Boolean subscribe;
}