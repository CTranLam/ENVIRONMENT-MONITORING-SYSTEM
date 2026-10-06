package com.iot.ptit.custom.service.storage;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Connection settings for the MinIO object storage that keeps profile avatars.
 *
 * <p>{@code endpoint} is the address the backend itself uses (for example the compose
 * service name), while {@code publicUrl} is the address browsers use. They differ inside
 * Docker, so both are configurable.</p>
 */
@ConfigurationProperties(prefix = "app.storage.minio")
public record MinioStorageProperties(
        String endpoint,
        String accessKey,
        String secretKey,
        String bucket,
        String publicUrl,
        String avatarPrefix
) {
    public MinioStorageProperties {
        if (avatarPrefix == null || avatarPrefix.isBlank()) {
            avatarPrefix = "avatars";
        }
    }

    /** Base URL used to build the browser-facing object URL. */
    public String resolvedPublicUrl() {
        if (publicUrl != null && !publicUrl.isBlank()) {
            return trimTrailingSlash(publicUrl);
        }
        return trimTrailingSlash(endpoint) + "/" + bucket;
    }

    private static String trimTrailingSlash(String value) {
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
