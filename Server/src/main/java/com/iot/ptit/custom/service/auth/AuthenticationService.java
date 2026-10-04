package com.iot.ptit.custom.service.auth;

import com.iot.ptit.custom.dto.auth.LoginRequest;
import com.iot.ptit.custom.dto.auth.LoginResponse;
import com.iot.ptit.custom.entity.auth.AppUser;
import com.iot.ptit.custom.repository.auth.AppUserRepository;
import com.iot.ptit.custom.security.jwt.JwtService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthenticationService {
    private final AppUserRepository appUserRepository;
    private final UserPermissionService userPermissionService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthenticationService(
            AppUserRepository appUserRepository,
            UserPermissionService userPermissionService,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.appUserRepository = appUserRepository;
        this.userPermissionService = userPermissionService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {
        AppUser user = appUserRepository.findByEmailIgnoreCase(request.email())
                .filter(candidate -> candidate.isActive() && !candidate.isDeleted())
                .orElseThrow(this::invalidCredentials);

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw invalidCredentials();
        }

        List<String> permissions = userPermissionService.findPermissionNamesByEmail(user.getEmail());
        return new LoginResponse(
                jwtService.createToken(user.getEmail()),
                "Bearer",
                jwtService.getExpirationSeconds(),
                user.getEmail(),
                permissions
        );
    }

    private BadCredentialsException invalidCredentials() {
        return new BadCredentialsException("Invalid email or password.");
    }
}
