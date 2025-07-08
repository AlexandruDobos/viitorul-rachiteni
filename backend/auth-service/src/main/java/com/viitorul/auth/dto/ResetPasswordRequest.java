package com.viitorul.auth.dto;

public record ResetPasswordRequest(String token, String newPassword) {}
