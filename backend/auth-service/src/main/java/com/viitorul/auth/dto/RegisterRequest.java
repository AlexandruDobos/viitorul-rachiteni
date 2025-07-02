package com.viitorul.auth.dto;

import com.viitorul.auth.entity.enums.UserRole;
import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private UserRole role;
}
