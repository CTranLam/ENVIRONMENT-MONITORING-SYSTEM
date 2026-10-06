package com.iot.ptit.custom.service.profile.utils;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public final class ProfileValueUtils {
    private ProfileValueUtils() {
    }

    public static ResponseStatusException conflict(String detail) {
        return new ResponseStatusException(HttpStatus.CONFLICT, detail);
    }

    public static String blankToNull(String value) {
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
