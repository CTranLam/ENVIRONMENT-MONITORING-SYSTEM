package com.iot.ptit.custom.service.profile.convert.response;

import com.iot.ptit.custom.dto.profile.UserProfileResponse;
import com.iot.ptit.custom.entity.auth.AppUser;

public final class UserProfileResponseConverter {
    private UserProfileResponseConverter() {
    }

    public static UserProfileResponse toResponse(AppUser user) {
        return new UserProfileResponse(user.getId(), user.getFullName(), user.getStudentId(), user.getClassName(),
                user.getEmail(), user.getAvatarUrl(), user.getBioText(), user.getLocation(), user.getRole(),
                user.getIotReportUrl(), user.getApiDocsUrl(), user.getGithubUrl(), user.getFigmaUrl());
    }
}
