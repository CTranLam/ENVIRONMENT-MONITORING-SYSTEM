package com.iot.ptit.custom.service.profile.utils;

import com.iot.ptit.custom.entity.auth.AppUser;
import com.iot.ptit.custom.repository.auth.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ProfileUserUtils {
    private final AppUserRepository appUserRepository;

    public AppUser findActiveUser(UUID userId) {
        return appUserRepository.findById(userId)
                .filter(user -> user.isActive() && !user.isDeleted())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User account was not found."));
    }
}
