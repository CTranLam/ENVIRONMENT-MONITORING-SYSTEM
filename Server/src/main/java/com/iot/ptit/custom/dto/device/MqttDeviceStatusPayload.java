package com.iot.ptit.custom.dto.device;

public record MqttDeviceStatusPayload(String device, String action, String status) {
}
