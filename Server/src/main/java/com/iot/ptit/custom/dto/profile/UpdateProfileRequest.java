package com.iot.ptit.custom.dto.profile;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(min = 1, max = 100) String fullName,
        @Size(min = 1, max = 20) String studentId,
        @Size(max = 50) String className,
        @Email @Size(max = 100) String email,
        @Size(max = 100) String location,
        String avatarUrl,
        String bioText,
        String iotReportUrl,
        String apiDocsUrl,
        String githubUrl,
        String figmaUrl
) {
}
