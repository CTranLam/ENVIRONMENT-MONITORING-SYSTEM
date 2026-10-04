package com.iot.ptit.custom.repository.auth;

import com.iot.ptit.custom.entity.auth.UserPermission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserPermissionRepository extends JpaRepository<UserPermission, Long> {
    List<UserPermission> findAllByUser_EmailIgnoreCaseAndDeletedFalse(String email);
}
