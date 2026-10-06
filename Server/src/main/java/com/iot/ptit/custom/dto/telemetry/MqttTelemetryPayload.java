package com.iot.ptit.custom.dto.telemetry;

public record MqttTelemetryPayload(Double temp, Double humidity, Double light) {
    public boolean isValid() {
        return isFinite(temp) && isFinite(humidity) && isFinite(light);
    }

    private static boolean isFinite(Double value) {
        return value != null && Double.isFinite(value);
    }
}
