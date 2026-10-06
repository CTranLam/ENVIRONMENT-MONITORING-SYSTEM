package com.iot.ptit.custom.dto.profile;

import com.iot.ptit.custom.enums.UserRole;
import java.util.UUID;

public record UserProfileResponse(
        UUID id,
        String fullName,
        String studentId,
        String className,
        String email,
        String avatarUrl,
        String bioText,
        String location,
        UserRole role,
        String iotReportUrl,
        String apiDocsUrl,
        String githubUrl,
        String figmaUrl
) {
}
