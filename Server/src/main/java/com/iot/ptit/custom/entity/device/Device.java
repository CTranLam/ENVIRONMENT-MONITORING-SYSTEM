package com.iot.ptit.custom.entity.device;

import com.iot.ptit.base.entity.BaseEntity;
import com.iot.ptit.custom.enums.DeviceStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "devices")
@Getter
@Setter
public class Device extends BaseEntity {
    @Column(name = "device_name", nullable = false, unique = true, length = 50)
    private String deviceName;

    @Column(name = "pin_relay", nullable = false, length = 10)
    private String pinRelay;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_status", nullable = false, length = 10)
    private DeviceStatus currentStatus = DeviceStatus.UNKNOWN;

    protected Device() {
    }

    public Device(String deviceName, String pinRelay) {
        this.deviceName = deviceName;
        this.pinRelay = pinRelay;
    }

}
