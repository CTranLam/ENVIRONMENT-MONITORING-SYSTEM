package com.iot.ptit.custom.entity.auth;

import com.iot.ptit.base.entity.BaseEntity;
import com.iot.ptit.custom.enums.UserRole;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
public class AppUser extends BaseEntity {
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "student_id", nullable = false, unique = true, length = 20)
    private String studentId;

    @Column(name = "class_name", length = 50)
    private String className;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(name = "bio_text", columnDefinition = "TEXT")
    private String bioText;

    @Column(length = 100)
    private String location;

    @Column(name = "iot_report_url", columnDefinition = "TEXT")
    private String iotReportUrl;

    @Column(name = "api_docs_url", columnDefinition = "TEXT")
    private String apiDocsUrl;

    @Column(name = "github_url", columnDefinition = "TEXT")
    private String githubUrl;

    @Column(name = "figma_url", columnDefinition = "TEXT")
    private String figmaUrl;

    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @Column(nullable = false)
    private boolean active = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role = UserRole.VIEWER;

    protected AppUser() {
    }

    public AppUser(
            String fullName,
            String studentId,
            String className,
            String email,
            String passwordHash
    ) {
        this.fullName = fullName;
        this.studentId = studentId;
        this.className = className;
        this.email = email.toLowerCase();
        this.passwordHash = passwordHash;
    }

}
