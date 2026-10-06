package com.iot.ptit.custom.dto.auth;

import java.util.List;
import com.iot.ptit.custom.dto.profile.UserProfileResponse;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        String email,
        List<String> permissions,
        UserProfileResponse profile
) {
}
