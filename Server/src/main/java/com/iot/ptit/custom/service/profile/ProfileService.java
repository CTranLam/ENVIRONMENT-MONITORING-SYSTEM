package com.iot.ptit.custom.service.profile;

import com.iot.ptit.custom.dto.profile.UpdateProfileRequest;
import com.iot.ptit.custom.dto.profile.UserProfileResponse;
import com.iot.ptit.custom.entity.auth.AppUser;
import com.iot.ptit.custom.repository.auth.AppUserRepository;
import com.iot.ptit.custom.service.profile.utils.ProfileUserUtils;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.UUID;

import static com.iot.ptit.custom.service.profile.convert.response.UserProfileResponseConverter.toResponse;
import static com.iot.ptit.custom.service.profile.utils.ProfileValueUtils.blankToNull;
import static com.iot.ptit.custom.service.profile.utils.ProfileValueUtils.conflict;

@RequiredArgsConstructor 
@Service
public class ProfileService {
    private final AppUserRepository appUserRepository;
    private final ProfileUserUtils profileUserUtils;

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(UUID userId) {
        return toResponse(profileUserUtils.findActiveUser(userId));
    }

    @Transactional
    public UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        AppUser user = profileUserUtils.findActiveUser(userId);
        if (request.email() != null) {
            String email = request.email().trim().toLowerCase(Locale.ROOT);
            if (!email.equalsIgnoreCase(user.getEmail()) && appUserRepository.existsByEmailIgnoreCase(email)) {
                throw conflict("Email is already in use.");
            }
            user.setEmail(email);
        }
        if (request.studentId() != null) {
            String studentId = request.studentId().trim();
            if (!studentId.equals(user.getStudentId()) && appUserRepository.existsByStudentId(studentId)) {
                throw conflict("Student ID is already in use.");
            }
            user.setStudentId(studentId);
        }
        if (request.fullName() != null) user.setFullName(request.fullName().trim());
        if (request.className() != null) user.setClassName(blankToNull(request.className()));
        if (request.location() != null) user.setLocation(blankToNull(request.location()));
        if (request.avatarUrl() != null) user.setAvatarUrl(blankToNull(request.avatarUrl()));
        if (request.bioText() != null) user.setBioText(blankToNull(request.bioText()));
        if (request.iotReportUrl() != null) user.setIotReportUrl(blankToNull(request.iotReportUrl()));
        if (request.apiDocsUrl() != null) user.setApiDocsUrl(blankToNull(request.apiDocsUrl()));
        if (request.githubUrl() != null) user.setGithubUrl(blankToNull(request.githubUrl()));
        if (request.figmaUrl() != null) user.setFigmaUrl(blankToNull(request.figmaUrl()));
        return toResponse(appUserRepository.save(user));
    }

}
