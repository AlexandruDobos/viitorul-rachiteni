package com.viitorul.app.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

@Configuration
@EnableConfigurationProperties(R2Properties.class)
@RequiredArgsConstructor
public class R2Config {

    private final R2Properties props;

    @Bean
    public S3Presigner s3Presigner() {
        // endpoint S3-compatible pentru R2
        String endpoint = "https://" + props.getAccountId() + ".r2.cloudflarestorage.com";

        return S3Presigner.builder()
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(props.getAccessKeyId(), props.getSecretKey())))
                // R2 acceptă "auto", dar SDK v2 cere un Region – US_EAST_1 e OK
                .region(Region.US_EAST_1)
                .endpointOverride(URI.create(endpoint))
                .build();
    }
}
