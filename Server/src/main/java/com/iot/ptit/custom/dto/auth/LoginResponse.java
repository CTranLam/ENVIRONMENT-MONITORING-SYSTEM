package com.iot.ptit.custom.dto.auth;

import java.util.List;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        String email,
        List<String> permissions
) {
}
