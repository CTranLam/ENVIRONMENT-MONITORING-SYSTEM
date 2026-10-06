package com.iot.ptit.custom.controller.profile;

import com.iot.ptit.custom.dto.profile.UpdateProfileRequest;
import com.iot.ptit.custom.dto.profile.UserProfileResponse;
import com.iot.ptit.custom.service.profile.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequiredArgsConstructor 
@RequestMapping("/api/profile/me")
@Tag(name = "Profile")
public class ProfileController {
    private final ProfileService profileService;

    @GetMapping
    @Operation(summary = "Get the signed-in user's profile")
    public UserProfileResponse getProfile(@AuthenticationPrincipal UUID userId) {
        return profileService.getProfile(userId);
    }

    @PutMapping
    @Operation(summary = "Update profile fields")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return ResponseEntity.ok(profileService.updateProfile(userId, request));
    }

    /**
     * Uploads a profile picture to MinIO and returns the refreshed profile, whose
     * {@code avatarUrl} already points at the stored object.
     */
    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload the signed-in user's avatar image")
    public ResponseEntity<UserProfileResponse> uploadAvatar(
            @AuthenticationPrincipal UUID userId,
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(profileService.updateAvatar(userId, file));
    }
}
