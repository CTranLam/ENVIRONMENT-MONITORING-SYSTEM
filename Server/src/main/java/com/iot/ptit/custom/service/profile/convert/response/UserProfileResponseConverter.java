package com.iot.ptit.custom.service.profile.convert.response;

import com.iot.ptit.custom.dto.profile.UserProfileResponse;
import com.iot.ptit.custom.entity.auth.AppUser;
import com.iot.ptit.custom.service.storage.MinioAvatarStorageService;

public final class UserProfileResponseConverter {
    private UserProfileResponseConverter() {
    }

    /**
     * Maps the entity to the API response, expanding a stored avatar object key into the
     * public object-storage URL the browser can render. External links are passed through.
     */
    public static UserProfileResponse toResponse(AppUser user, MinioAvatarStorageService avatarStorageService) {
        return new UserProfileResponse(user.getId(), user.getFullName(), user.getStudentId(), user.getClassName(),
                user.getEmail(), avatarStorageService.resolveUrl(user.getAvatarUrl()), user.getBioText(),
                user.getLocation(), user.getRole(),
                user.getIotReportUrl(), user.getApiDocsUrl(), user.getGithubUrl(), user.getFigmaUrl());
    }
}
