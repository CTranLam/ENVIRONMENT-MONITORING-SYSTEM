package com.iot.ptit.custom.controller.actionhistory;

import com.iot.ptit.custom.dto.actionhistory.PaginatedActionHistoryResponse;
import com.iot.ptit.custom.service.actionhistory.ActionHistoryQueryService;
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
 * Device control history API consumed by the Action History page.
 *
 * <p>Query parameters mirror the client filter state one-to-one so the Redux slice can be
 * passed straight through as request params.</p>
 */
@RestController
@RequestMapping("/api/actions")
@RequiredArgsConstructor
@Validated
@Tag(name = "Action History")
public class ActionHistoryController {
    private final ActionHistoryQueryService actionHistoryQueryService;

    @GetMapping("/history")
    @Operation(summary = "Query device control history with paging, filtering and sorting")
    public PaginatedActionHistoryResponse getHistory(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "all")
            @Pattern(regexp = "all|ledGreen|ledRed|LED_GREEN|LED_RED", message = "Unsupported device key.")
            String device,
            @RequestParam(defaultValue = "all")
            @Pattern(regexp = "all|ON|OFF|on|off", message = "Unsupported action.")
            String action,
            @RequestParam(defaultValue = "all")
            @Pattern(regexp = "all|PENDING|SUCCESS|FAILED|pending|success|failed", message = "Unsupported status.")
            String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endTime,
            @RequestParam(defaultValue = "timestamp") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder,
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int pageSize
    ) {
        return actionHistoryQueryService.getHistory(
                search, device, action, status, startTime, endTime, sortBy, sortOrder, page, pageSize);
    }
}
