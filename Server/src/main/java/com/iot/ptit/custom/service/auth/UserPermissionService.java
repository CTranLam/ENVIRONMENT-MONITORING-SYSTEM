package com.iot.ptit.custom.service.auth;

import com.iot.ptit.custom.repository.auth.UserPermissionRepository;
import com.iot.ptit.custom.repository.auth.AppUserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserPermissionService {
    private final UserPermissionRepository userPermissionRepository;
    private final AppUserRepository appUserRepository;

    public UserPermissionService(
            UserPermissionRepository userPermissionRepository,
            AppUserRepository appUserRepository
    ) {
        this.userPermissionRepository = userPermissionRepository;
        this.appUserRepository = appUserRepository;
    }

    public List<GrantedAuthority> findAuthoritiesByEmail(String email) {
        return userPermissionRepository.findAllByUser_EmailIgnoreCaseAndDeletedFalse(email).stream()
                .map(permission -> new SimpleGrantedAuthority(permission.getPermission()))
                .map(GrantedAuthority.class::cast)
                .toList();
    }

    public List<String> findPermissionNamesByEmail(String email) {
        return userPermissionRepository.findAllByUser_EmailIgnoreCaseAndDeletedFalse(email).stream()
                .map(permission -> permission.getPermission())
                .toList();
    }

    public boolean isActiveUser(String email) {
        return appUserRepository.findByEmailIgnoreCase(email)
                .map(user -> user.isActive() && !user.isDeleted())
                .orElse(false);
    }
}
