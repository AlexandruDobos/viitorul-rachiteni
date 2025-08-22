package com.viitorul.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContactMessageRequestDTO {

    @NotBlank(message = "Numele este obligatoriu")
    private String name;

    @NotBlank(message = "Emailul este obligatoriu")
    @Email(message = "Email invalid")
    private String email;

    private String phone;

    @NotBlank(message = "Mesajul nu poate fi gol")
    @Size(max = 2000, message = "Mesajul nu poate depăși 2000 de caractere")
    private String message;
}

