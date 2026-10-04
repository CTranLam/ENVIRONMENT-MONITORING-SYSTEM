package com.iot.ptit.custom.entity.auth;

import com.iot.ptit.base.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "user_permission", uniqueConstraints = @UniqueConstraint(
        name = "uk_user_permission_user_permission",
        columnNames = {"user_id", "permission"}
))
@Getter
@Setter
public class UserPermission extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(nullable = false, length = 100)
    private String permission;

    protected UserPermission() {
    }

    public UserPermission(AppUser user, String permission) {
        this.user = user;
        this.permission = permission;
    }

}
