package com.viitorul.auth.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String name;           // noul nume
    private Boolean subscribe;     // true/false (null = nu modifica)
}
