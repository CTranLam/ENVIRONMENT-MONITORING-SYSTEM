package com.iot.ptit.custom.storage;

import com.iot.ptit.custom.service.storage.MinioAvatarStorageService;
import com.iot.ptit.custom.service.storage.MinioStorageProperties;
import io.minio.BucketExistsArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class MinioAvatarStorageServiceTests {
    private static final UUID USER_ID = UUID.fromString("01a110b2-63d8-78a5-91a2-3f07c3fba070");

    private MinioClient minioClient;
    private MinioAvatarStorageService storageService;

    @BeforeEach
    void setUp() throws Exception {
        minioClient = mock(MinioClient.class);
        when(minioClient.bucketExists(any(BucketExistsArgs.class))).thenReturn(true);

        MinioStorageProperties properties = new MinioStorageProperties(
                "http://minio:9000",
                "ems-minio",
                "ems-minio-secret",
                "ems-avatars",
                "http://localhost:9010/ems-avatars",
                "avatars");
        storageService = new MinioAvatarStorageService(minioClient, properties);
    }

    @Test
    void uploadsPngUnderAnAvatarPrefixedKey() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "me.png", "image/png", "fake-image-bytes".getBytes());

        String objectKey = storageService.uploadAvatar(USER_ID, file, null);

        assertThat(objectKey).startsWith("avatars/" + USER_ID + "/").endsWith(".png");

        ArgumentCaptor<PutObjectArgs> captor = ArgumentCaptor.forClass(PutObjectArgs.class);
        verify(minioClient).putObject(captor.capture());
        assertThat(captor.getValue().bucket()).isEqualTo("ems-avatars");
        assertThat(captor.getValue().object()).isEqualTo(objectKey);
        assertThat(captor.getValue().contentType()).isEqualTo("image/png");
    }

    @Test
    void removesThePreviousStoredObject() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "me.jpg", "image/jpeg", "fake-image-bytes".getBytes());
        String previousKey = "avatars/" + USER_ID + "/old-avatar.jpg";

        storageService.uploadAvatar(USER_ID, file, previousKey);

        ArgumentCaptor<RemoveObjectArgs> captor = ArgumentCaptor.forClass(RemoveObjectArgs.class);
        verify(minioClient).removeObject(captor.capture());
        assertThat(captor.getValue().object()).isEqualTo(previousKey);
    }

    @Test
    void neverDeletesExternalLinks() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "me.jpg", "image/jpeg", "fake-image-bytes".getBytes());

        storageService.uploadAvatar(USER_ID, file, "https://example.com/avatar.jpg");

        verify(minioClient, never()).removeObject(any(RemoveObjectArgs.class));
    }

    @Test
    void resolvesStoredKeysToThePublicUrl() {
        assertThat(storageService.resolveUrl("avatars/" + USER_ID + "/a.png"))
                .isEqualTo("http://localhost:9010/ems-avatars/avatars/" + USER_ID + "/a.png");
        assertThat(storageService.resolveUrl("https://example.com/a.png"))
                .isEqualTo("https://example.com/a.png");
        assertThat(storageService.resolveUrl("data:image/png;base64,AAAA"))
                .isEqualTo("data:image/png;base64,AAAA");
        assertThat(storageService.resolveUrl(null)).isNull();
        assertThat(storageService.resolveUrl("  ")).isNull();
    }

    @Test
    void resolvesThePublicUrlFromTheEndpointWhenNotConfigured() {
        MinioStorageProperties withoutPublicUrl = new MinioStorageProperties(
                "http://minio:9000/", "user", "secret", "ems-avatars", "", "avatars");
        MinioAvatarStorageService service = new MinioAvatarStorageService(minioClient, withoutPublicUrl);

        assertThat(service.resolveUrl("avatars/x.png")).isEqualTo("http://minio:9000/ems-avatars/avatars/x.png");
        assertThat(withoutPublicUrl.avatarPrefix()).isEqualTo("avatars");
    }

    @Test
    void rejectsNonImageUploads() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "notes.pdf", "application/pdf", "not-an-image".getBytes());

        assertThatThrownBy(() -> storageService.uploadAvatar(USER_ID, file, null))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("PNG, JPG or WEBP");
    }

    @Test
    void rejectsEmptyUploads() {
        MockMultipartFile file = new MockMultipartFile("file", "empty.png", "image/png", new byte[0]);

        assertThatThrownBy(() -> storageService.uploadAvatar(USER_ID, file, null))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("image file is required");
    }

    @Test
    void rejectsUploadsLargerThanTwoMegabytes() {
        byte[] tooBig = new byte[(int) MinioAvatarStorageService.MAX_AVATAR_BYTES + 1];
        MockMultipartFile file = new MockMultipartFile("file", "big.png", "image/png", tooBig);

        assertThatThrownBy(() -> storageService.uploadAvatar(USER_ID, file, null))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("2 MB or smaller");
    }
}
