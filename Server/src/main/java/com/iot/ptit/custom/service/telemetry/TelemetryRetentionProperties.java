package com.iot.ptit.custom.service.telemetry;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Settings for retaining append-only raw sensor telemetry. */
@ConfigurationProperties(prefix = "app.telemetry.retention")
public record TelemetryRetentionProperties(
        int days,
        int cleanupBatchSize,
        String cleanupCron,
        String cleanupZone
) {
    public TelemetryRetentionProperties {
        if (days < 1) {
            throw new IllegalArgumentException("Telemetry retention days must be at least one.");
        }
        if (cleanupBatchSize < 1) {
            throw new IllegalArgumentException("Telemetry cleanup batch size must be at least one.");
        }
    }
}
