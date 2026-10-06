package com.iot.ptit.custom.service.storage;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.InputStream;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Stores profile avatars in MinIO.
 *
 * <p>The database keeps the storage <em>key</em> (for example
 * {@code avatars/<userId>/<uuid>.jpg}) while {@link #resolveUrl(String)} turns it into the
 * browser-facing URL. Absolute URLs typed by the user are passed through untouched, so
 * this stays backwards compatible with the previous "paste a link" flow.</p>
 */
@Service
public class MinioAvatarStorageService {
    public static final long MAX_AVATAR_BYTES = 2L * 1024 * 1024;

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp");

    private static final Map<String, String> EXTENSION_BY_CONTENT_TYPE = Map.of(
            "image/jpeg", "jpg",
            "image/jpg", "jpg",
            "image/png", "png",
            "image/webp", "webp");

    private final MinioClient minioClient;
    private final MinioStorageProperties properties;

    public MinioAvatarStorageService(MinioClient minioClient, MinioStorageProperties properties) {
        this.minioClient = minioClient;
        this.properties = properties;
    }

    /**
     * Uploads a new avatar for the user and removes the previous stored object.
     *
     * @return the object key to persist on the user row
     */
    public String uploadAvatar(UUID userId, MultipartFile file, String previousAvatarUrlOrKey) {
        validate(file);

        String contentType = file.getContentType() == null
                ? ""
                : file.getContentType().toLowerCase(Locale.ROOT);
        String extension = EXTENSION_BY_CONTENT_TYPE.getOrDefault(contentType, "jpg");
        String objectKey = "%s/%s/%s.%s".formatted(properties.avatarPrefix(), userId, UUID.randomUUID(), extension);

        ensureBucket();
        try (InputStream input = file.getInputStream()) {
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(properties.bucket())
                    .object(objectKey)
                    .stream(input, file.getSize(), -1)
                    .contentType(contentType.isBlank() ? "image/jpeg" : contentType)
                    .build());
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Could not upload the avatar to object storage.");
        }

        removeStoredObject(previousAvatarUrlOrKey);
        return objectKey;
    }

    /**
     * Converts a persisted value into a URL the browser can load.
     *
     * <p>External links ({@code https://...}), inline data URLs and relative paths are
     * returned unchanged; only internally stored object keys are expanded.</p>
     */
    public String resolveUrl(String avatarUrlOrKey) {
        String stored = avatarUrlOrKey;
        if (stored == null || stored.isBlank()) {
            return null;
        }
        String trimmed = stored.trim();
        if (isExternalValue(trimmed)) {
            return trimmed;
        }
        String key = trimmed.startsWith("/") ? trimmed.substring(1) : trimmed;
        return properties.resolvedPublicUrl() + "/" + key;
    }

    /** Deletes the previously stored object when it lives in this bucket. */
    public void removeStoredObject(String avatarUrlOrKey) {
        String objectKey = toObjectKey(avatarUrlOrKey);
        if (objectKey == null) {
            return;
        }
        try {
            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(properties.bucket())
                    .object(objectKey)
                    .build());
        } catch (Exception ignored) {
            // The old object is only orphaned storage; never fail the user request for it.
        }
    }

    /**
     * Maps a persisted value back to an object key, or {@code null} when it is not an
     * object owned by this bucket.
     */
    private String toObjectKey(String avatarUrlOrKey) {
        if (avatarUrlOrKey == null || avatarUrlOrKey.isBlank()) {
            return null;
        }
        String stored = avatarUrlOrKey.trim();
        if (isExternalValue(stored)) {
            String publicBase = properties.resolvedPublicUrl();
            if (!stored.startsWith(publicBase + "/")) {
                return null;
            }
            stored = stored.substring(publicBase.length() + 1);
        }
        String key = stored.startsWith("/") ? stored.substring(1) : stored;
        return key.startsWith(properties.avatarPrefix() + "/") ? key : null;
    }

    private boolean isExternalValue(String value) {
        return value.startsWith("http://")
                || value.startsWith("https://")
                || value.startsWith("data:")
                || value.startsWith("//");
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "An image file is required.");
        }
        if (file.getSize() > MAX_AVATAR_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The avatar must be 2 MB or smaller.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only PNG, JPG or WEBP images are supported.");
        }
    }

    /** Creates the bucket on first use, covering a MinIO that was started after the API. */
    private void ensureBucket() {
        try {
            if (!minioClient.bucketExists(BucketExistsArgs.builder().bucket(properties.bucket()).build())) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(properties.bucket()).build());
            }
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Object storage is unavailable.");
        }
    }
}
