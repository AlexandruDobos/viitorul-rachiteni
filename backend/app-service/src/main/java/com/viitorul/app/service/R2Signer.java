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
        // Construim cererea pentru obiect (inclusiv content-type ca metadata)
        PutObjectRequest put = PutObjectRequest.builder()
                .bucket(props.getBucket())
                .key(key)
                .contentType(contentType) // va fi inclus în semnătură
                .build();

        PutObjectPresignRequest req = PutObjectPresignRequest.builder()
                .putObjectRequest(put)
                .signatureDuration(ttl)
                .build();

        // Obținem URL-ul presigned + header-ele care TREBUIE trimise la PUT
        PresignedPutObjectRequest presigned = presigner.presignPutObject(req);
        URL url = presigned.url();

        // Flatten pentru JSON: header -> valoare (dacă sunt multiple, le unim cu ,)
        Map<String, String> headers = new HashMap<>();
        for (Map.Entry<String, List<String>> e : presigned.signedHeaders().entrySet()) {
            headers.put(e.getKey(), String.join(",", e.getValue()));
        }

        return new Presigned(url, headers);
    }

    public String publicUrl(String key) {
        String base = props.getPublicBaseUrl();
        if (base.endsWith("/")) base = base.substring(0, base.length() - 1);
        return base + "/" + key;
    }

    public record Presigned(URL url, Map<String, String> headers) {}
}
