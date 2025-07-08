package com.viitorul.common.events;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class PasswordResetRequestedEvent implements Serializable {
    private String name;
    private String email;
    private String resetToken;
}
