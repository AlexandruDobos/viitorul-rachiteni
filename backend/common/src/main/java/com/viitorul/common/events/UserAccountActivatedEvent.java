package com.viitorul.common.events;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAccountActivatedEvent implements Serializable {
    private String name;
    private String email;
}
