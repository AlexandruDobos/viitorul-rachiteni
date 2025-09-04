package com.viitorul.app.service;

import com.viitorul.app.config.R2Properties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.auth.signer.AwsS3V4Signer;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.net.URL;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class R2Signer {

    private final R2Properties props;
    private final S3Presigner presigner;

    public Presigned putPresign(String key, String contentType, Duration ttl) {
        // NU punem .contentType(contentType) aici, ca să nu fie semnat
        PutObjectRequest put = PutObjectRequest.builder()
                .bucket(props.getBucket())
                .key(key)
                .build();

        PutObjectPresignRequest req = PutObjectPresignRequest.builder()
                .putObjectRequest(put)
                .signatureDuration(ttl)
                .build();

        PresignedPutObjectRequest presigned = presigner.presignPutObject(req);

        Map<String, String> headers = new HashMap<>();
        presigned.signedHeaders().forEach((k, v) -> headers.put(k, String.join(",", v)));

        return new Presigned(presigned.url(), headers);
    }

    public String publicUrl(String key) {
        String base = props.getPublicBaseUrl();
        if (base.endsWith("/")) base = base.substring(0, base.length() - 1);
        return base + "/" + key;
    }

    public record Presigned(URL url, Map<String, String> headers) {}
}
