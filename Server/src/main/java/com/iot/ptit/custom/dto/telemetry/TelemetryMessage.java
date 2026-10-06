package com.iot.ptit.custom.dto.telemetry;

import java.time.Instant;

public record TelemetryMessage(Instant recordedAt, double temperature, double humidity, double light) {
}
