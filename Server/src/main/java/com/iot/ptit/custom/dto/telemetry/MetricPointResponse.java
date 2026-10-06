package com.iot.ptit.custom.dto.telemetry;

import java.time.Instant;

public record MetricPointResponse(Instant recordedAt, double value) {
}
