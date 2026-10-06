package com.iot.ptit.custom.controller.profile;

import com.iot.ptit.custom.dto.profile.UpdateProfileRequest;
import com.iot.ptit.custom.dto.profile.UserProfileResponse;
import com.iot.ptit.custom.service.profile.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor 
@RequestMapping("/api/profile/me")
public class ProfileController {
    private final ProfileService profileService;

    @GetMapping
    public UserProfileResponse getProfile(@AuthenticationPrincipal UUID userId) {
        return profileService.getProfile(userId);
    }

    @PutMapping
    public ResponseEntity<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return ResponseEntity.ok(profileService.updateProfile(userId, request));
    }
}
