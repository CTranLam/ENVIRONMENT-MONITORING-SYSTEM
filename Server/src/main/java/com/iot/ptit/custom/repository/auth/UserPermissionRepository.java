package com.iot.ptit.custom.repository.auth;

import com.iot.ptit.custom.entity.auth.UserPermission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UserPermissionRepository extends JpaRepository<UserPermission, UUID> {
    List<UserPermission> findAllByUser_IdAndDeletedFalse(UUID userId);
}
