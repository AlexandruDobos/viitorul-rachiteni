package com.viitorul.auth.dto;

import lombok.Data;

@Data
public class UpdateAccountRequest {
    private String name;
    private Boolean subscribe;

    private String currentPassword;
    private String newPassword;
}
