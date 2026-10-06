package com.iot.ptit.custom.service.storage;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.SetBucketPolicyArgs;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(MinioStorageProperties.class)
@Slf4j
public class MinioStorageConfiguration {

    /**
     * Builds the MinIO client and makes sure the avatar bucket exists.
     *
     * <p>Bucket creation is attempted on startup but a failure is not fatal: a backend
     * restart must not be blocked because object storage is briefly unavailable, and the
     * first upload retries the check.</p>
     */
    @Bean
    public MinioClient minioClient(MinioStorageProperties properties) {
        MinioClient client = MinioClient.builder()
                .endpoint(properties.endpoint())
                .credentials(properties.accessKey(), properties.secretKey())
                .build();
        ensureBucket(client, properties);
        return client;
    }

    private void ensureBucket(MinioClient client, MinioStorageProperties properties) {
        String bucket = properties.bucket();
        try {
            if (!client.bucketExists(BucketExistsArgs.builder().bucket(bucket).build())) {
                client.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
                log.info("Created MinIO bucket '{}' for profile avatars", bucket);
            }
            applyPublicReadPolicy(client, bucket);
        } catch (Exception exception) {
            log.warn("MinIO bucket '{}' is not ready yet ({}). Avatar upload will retry.",
                    bucket, exception.getMessage());
        }
    }

    /**
     * Avatars are rendered by the browser with a plain {@code <img>} tag, which cannot send
     * an Authorization header, so read access to this dedicated bucket is anonymous. Only
     * profile pictures are ever written here.
     */
    private void applyPublicReadPolicy(MinioClient client, String bucket) throws Exception {
        String policy = """
                {
                  "Version": "2012-10-17",
                  "Statement": [
                    {
                      "Effect": "Allow",
                      "Principal": {"AWS": ["*"]},
                      "Action": ["s3:GetObject"],
                      "Resource": ["arn:aws:s3:::%s/*"]
                    }
                  ]
                }
                """.formatted(bucket);
        client.setBucketPolicy(SetBucketPolicyArgs.builder().bucket(bucket).config(policy).build());
    }
}
