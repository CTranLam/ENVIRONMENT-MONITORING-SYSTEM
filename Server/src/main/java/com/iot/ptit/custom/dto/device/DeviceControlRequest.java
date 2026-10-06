package com.iot.ptit.custom.dto.device;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DeviceControlRequest(@NotBlank String deviceKey, @NotNull Boolean targetState) {
}
