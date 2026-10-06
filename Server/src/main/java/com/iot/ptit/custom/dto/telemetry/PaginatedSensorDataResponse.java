package com.iot.ptit.custom.dto.telemetry;

import java.util.List;

/**
 * Paginated envelope for the sensor-data history table. Field names intentionally match
 * the web client contract ({@code items}, {@code total}, {@code page}, {@code pageSize},
 * {@code totalPages}).
 */
public record PaginatedSensorDataResponse(
        List<SensorDataRecordResponse> items,
        long total,
        int page,
        int pageSize,
        int totalPages
) {
    public static PaginatedSensorDataResponse of(
            List<SensorDataRecordResponse> items,
            long total,
            int page,
            int pageSize
    ) {
        int totalPages = pageSize <= 0 ? 1 : (int) Math.max(1, (total + pageSize - 1) / pageSize);
        return new PaginatedSensorDataResponse(items, total, page, pageSize, totalPages);
    }
}
