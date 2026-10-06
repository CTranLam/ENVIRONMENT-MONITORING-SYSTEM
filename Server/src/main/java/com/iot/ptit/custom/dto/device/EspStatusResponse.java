package com.iot.ptit.custom.dto.device;

import java.time.Instant;

public record EspStatusResponse(boolean online, Instant lastSeenAt) {
}
