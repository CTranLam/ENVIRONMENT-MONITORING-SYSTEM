package com.iot.ptit.custom.dto.actionhistory;

import java.time.Instant;
import java.util.UUID;

/**
 * One row of the device control history table.
 *
 * <p>Field names follow the web client contract: {@code deviceKey} is the UI device key
 * ({@code ledGreen}/{@code ledRed}) and {@code timestamp} is an absolute instant that the
 * client renders in its own local time.</p>
 */
public record ActionHistoryRecordResponse(
        UUID id,
        UUID deviceId,
        String device,
        String deviceKey,
        String action,
        String status,
        String triggerBy,
        String sentBy,
        Instant timestamp
) {
}
