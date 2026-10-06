package com.iot.ptit.custom.service.auth;

import com.iot.ptit.custom.dto.auth.LoginRequest;
import com.iot.ptit.custom.dto.auth.LoginResponse;
import com.iot.ptit.custom.dto.auth.RegisterRequest;
import com.iot.ptit.custom.dto.profile.UserProfileResponse;
import com.iot.ptit.custom.entity.auth.AppUser;
import com.iot.ptit.custom.enums.UserRole;
import com.iot.ptit.custom.repository.auth.AppUserRepository;
import com.iot.ptit.custom.security.jwt.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

import static com.iot.ptit.custom.service.profile.convert.response.UserProfileResponseConverter.toResponse;

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

        return createLoginResponse(user);
    }

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        String studentId = request.studentId().trim();
        if (appUserRepository.existsByEmailIgnoreCase(email)) {
            throw conflict("Email is already in use.");
        }
        if (appUserRepository.existsByStudentId(studentId)) {
            throw conflict("Student ID is already in use.");
        }
        AppUser user = new AppUser(request.fullName().trim(), studentId, blankToNull(request.className()), email,
                passwordEncoder.encode(request.password()));
        user.setRole(UserRole.VIEWER);
        return createLoginResponse(appUserRepository.save(user));
    }

    private LoginResponse createLoginResponse(AppUser user) {
        List<String> permissions = userPermissionService.findPermissionNamesByUserId(user.getId());
        UserProfileResponse profile = toResponse(user);
        return new LoginResponse(
                jwtService.createToken(user.getId()),
                "Bearer",
                jwtService.getExpirationSeconds(),
                user.getEmail(),
                permissions,
                profile
        );
    }

    private BadCredentialsException invalidCredentials() {
        return new BadCredentialsException("Invalid email or password.");
    }

    private ResponseStatusException conflict(String detail) {
        return new ResponseStatusException(HttpStatus.CONFLICT, detail);
    }

    private String blankToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
