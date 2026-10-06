package com.iot.ptit.custom.controller.device;

import com.iot.ptit.custom.dto.device.DeviceControlRequest;
import com.iot.ptit.custom.dto.device.DeviceStatusResponse;
import com.iot.ptit.custom.dto.device.EspStatusResponse;
import com.iot.ptit.custom.service.device.DeviceControlService;
import com.iot.ptit.custom.service.device.EspStatusService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
public class DeviceController {
    private final DeviceControlService deviceControlService;
    private final EspStatusService espStatusService;

    @GetMapping("/status")
    public List<DeviceStatusResponse> getStatuses() { return deviceControlService.getStatuses(); }

    @PostMapping("/control")
    public DeviceStatusResponse control(
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody DeviceControlRequest request
    ) {
        return deviceControlService.command(userId, request);
    }

    @GetMapping("/esp-status")
    public EspStatusResponse getEspStatus() { return espStatusService.getStatus(); }
}
