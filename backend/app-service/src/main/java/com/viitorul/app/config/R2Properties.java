package com.viitorul.app.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter @Setter
@ConfigurationProperties(prefix = "r2")
public class R2Properties {
    private String accountId;
    private String accessKeyId;
    private String secretKey;
    private String bucket;
    private String publicBaseUrl;
}
