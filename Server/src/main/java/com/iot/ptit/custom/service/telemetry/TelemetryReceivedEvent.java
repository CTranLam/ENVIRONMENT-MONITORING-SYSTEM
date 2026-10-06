package com.iot.ptit.custom.service.telemetry;

import com.iot.ptit.custom.dto.telemetry.TelemetryMessage;

public record TelemetryReceivedEvent(TelemetryMessage message) {
}
