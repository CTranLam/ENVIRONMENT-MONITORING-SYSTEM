package com.iot.ptit.custom.controller.telemetry;

import com.iot.ptit.custom.dto.telemetry.DashboardTelemetryResponse;
import com.iot.ptit.custom.service.telemetry.DashboardTelemetryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/telemetry")
@RequiredArgsConstructor
@Validated
@Tag(name = "Telemetry")
public class TelemetryController {
    private final DashboardTelemetryService dashboardTelemetryService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get recent telemetry points for the dashboard charts")
    public DashboardTelemetryResponse getDashboardTelemetry(
            @RequestParam(defaultValue = "60") @Min(1) @Max(120) int limit
    ) {
        return dashboardTelemetryService.getRecent(limit);
    }
}
