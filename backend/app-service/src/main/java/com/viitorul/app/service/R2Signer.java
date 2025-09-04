package com.viitorul.app.service;

import com.viitorul.app.config.R2Properties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.net.URL;
import java.time.Duration;

@Component
@RequiredArgsConstructor
public class R2Signer {

    private final R2Properties props;
    private final S3Presigner presigner;

    public URL presignPut(String key, String contentType, Duration ttl) {
        PutObjectRequest put = PutObjectRequest.builder()
                .bucket(props.getBucket())
                .key(key)
                .contentType(contentType)
                .build();

        PutObjectPresignRequest req = PutObjectPresignRequest.builder()
                .putObjectRequest(put)
                .signatureDuration(ttl)
                .build();

        return presigner.presignPutObject(req).url();
    }

    public String publicUrl(String key) {
        String base = props.getPublicBaseUrl();
        if (base.endsWith("/")) base = base.substring(0, base.length() - 1);
        return base + "/" + key; // pentru r2.dev include deja bucket în base
    }
}
