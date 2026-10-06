package com.iot.ptit.custom.service.device;

import com.iot.ptit.custom.dto.device.MqttDeviceStatusPayload;

public record MqttDeviceStatusEvent(MqttDeviceStatusPayload payload) {
}
