package com.iot.ptit.custom.controller.telemetry;

import com.iot.ptit.custom.dto.telemetry.PaginatedSensorDataResponse;
import com.iot.ptit.custom.service.telemetry.SensorDataQueryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

/**
 * Sensor data history API consumed by the Sensor Data page.
 *
 * <p>Query parameters mirror the client filter state one-to-one so the Redux slice can be
 * passed straight through as request params.</p>
 */
@RestController
@RequestMapping("/api/sensors")
@RequiredArgsConstructor
@Validated
@Tag(name = "Sensor Data")
public class SensorDataController {
    private final SensorDataQueryService sensorDataQueryService;

    @GetMapping("/history")
    @Operation(summary = "Query persisted sensor telemetry with paging, filtering and sorting")
    public PaginatedSensorDataResponse getHistory(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "all")
            @Pattern(regexp = "all|temperature|humidity|light|TEMPERATURE|HUMIDITY|LIGHT", message = "Unsupported sensor type.")
            String type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endTime,
            @RequestParam(defaultValue = "timestamp") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder,
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int pageSize
    ) {
        return sensorDataQueryService.getHistory(
                search, type, startTime, endTime, sortBy, sortOrder, page, pageSize);
    }
}
