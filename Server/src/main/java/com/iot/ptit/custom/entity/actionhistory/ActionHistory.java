package com.iot.ptit.custom.entity.actionhistory;

import com.iot.ptit.base.entity.BaseEntity;
import com.iot.ptit.custom.entity.auth.AppUser;
import com.iot.ptit.custom.entity.device.Device;
import com.iot.ptit.custom.enums.ActionStatus;
import com.iot.ptit.custom.enums.ActionTrigger;
import com.iot.ptit.custom.enums.DeviceActionType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "action_history")
@Getter
@Setter
public class ActionHistory extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private AppUser user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private DeviceActionType action;

    @Enumerated(EnumType.STRING)
    @Column(name = "trigger_by", nullable = false, length = 50)
    private ActionTrigger triggerBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ActionStatus status = ActionStatus.PENDING;

    protected ActionHistory() {
    }

    public ActionHistory(Device device, AppUser user, DeviceActionType action, ActionTrigger triggerBy) {
        this.device = device;
        this.user = user;
        this.action = action;
        this.triggerBy = triggerBy;
    }

}
