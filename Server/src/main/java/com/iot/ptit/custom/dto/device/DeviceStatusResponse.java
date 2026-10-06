package com.iot.ptit.custom.dto.device;

public record DeviceStatusResponse(String deviceKey, boolean on, String status) {
}
