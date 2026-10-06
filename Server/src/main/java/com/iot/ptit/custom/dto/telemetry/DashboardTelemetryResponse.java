package com.iot.ptit.custom.dto.telemetry;

import java.util.List;

public record DashboardTelemetryResponse(
        List<MetricPointResponse> temperature,
        List<MetricPointResponse> humidity,
        List<MetricPointResponse> light
) {
}
