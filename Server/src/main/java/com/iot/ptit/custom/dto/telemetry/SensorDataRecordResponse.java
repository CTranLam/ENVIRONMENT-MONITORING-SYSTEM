package com.iot.ptit.custom.dto.telemetry;

import java.time.Instant;
import java.util.UUID;

/**
 * One row of the sensor-data history table.
 *
 * <p>{@code sensorType} carries the backend enum name (for example {@code TEMPERATURE});
 * the web client maps it to its own lowercase metric key.</p>
 */
public record SensorDataRecordResponse(
        UUID id,
        String sensorName,
        String sensorType,
        double value,
        String unit,
        Instant recordedAt
) {
}
