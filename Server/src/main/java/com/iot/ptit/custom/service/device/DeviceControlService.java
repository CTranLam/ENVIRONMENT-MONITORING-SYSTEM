package com.iot.ptit.custom.service.device;

import com.iot.ptit.custom.dto.device.DeviceControlRequest;
import com.iot.ptit.custom.dto.device.DeviceStatusResponse;
import com.iot.ptit.custom.dto.device.MqttDeviceStatusPayload;
import com.iot.ptit.custom.entity.device.Device;
import com.iot.ptit.custom.entity.actionhistory.ActionHistory;
import com.iot.ptit.custom.entity.auth.AppUser;
import com.iot.ptit.custom.enums.ActionStatus;
import com.iot.ptit.custom.enums.ActionTrigger;
import com.iot.ptit.custom.enums.DeviceActionType;
import com.iot.ptit.custom.enums.DeviceStatus;
import com.iot.ptit.custom.repository.device.DeviceRepository;
import com.iot.ptit.custom.repository.device.ActionHistoryRepository;
import com.iot.ptit.custom.repository.auth.AppUserRepository;
import com.iot.ptit.custom.service.mqtt.MqttTelemetrySubscriber;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class DeviceControlService {
    private final DeviceRepository deviceRepository;
    private final ActionHistoryRepository actionHistoryRepository;
    private final AppUserRepository appUserRepository;
    private final MqttTelemetrySubscriber mqttClient;
    private final SimpMessagingTemplate messagingTemplate;
    private final EspStatusService espStatusService;
    private final PlatformTransactionManager transactionManager;

    @Transactional(readOnly = true)
    public List<DeviceStatusResponse> getStatuses() {
        return deviceRepository.findAllByDeletedFalseOrderByDeviceNameAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Handle a manual control request coming from the web control panel.
     *
     * <p>The audit row is committed in its own transaction before the MQTT command is
     * published, so a broker outage can never roll back (and silently lose) the audit
     * trail. If the publish fails the row is flipped to {@code FAILED} and the caller
     * receives a 503 instead of an optimistic {@code PENDING} status.</p>
     */
    public DeviceStatusResponse command(UUID userId, DeviceControlRequest request) {
        String deviceName = toDeviceName(request.deviceKey());
        DeviceActionType action = request.targetState() ? DeviceActionType.ON : DeviceActionType.OFF;

        // Step 1: commit the PENDING audit row in an isolated transaction.
        ActionHistory history = inNewTransaction(() -> {
            Device device = deviceRepository.findByDeviceNameAndDeletedFalse(deviceName)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Device was not found."));
            AppUser user = appUserRepository.findById(userId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User account was not found."));
            return actionHistoryRepository.save(new ActionHistory(device, user, action, ActionTrigger.MANUAL));
        });

        // Step 2: publish the raw command to the ESP8266. Failures are contained here so
        // the audit row committed above always survives.
        try {
            mqttClient.publishDeviceCommand(toCommand(deviceName, request.targetState()));
        } catch (RuntimeException exception) {
            markActionFailed(history, userId);
            log.error("Could not publish MQTT command for {} ({}): {}",
                    deviceName, request.deviceKey(), exception.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "The device command could not be delivered to the MQTT broker.");
        }

        return new DeviceStatusResponse(request.deviceKey(), request.targetState(), "PENDING");
    }

    @EventListener
    @Transactional
    public void handleStatus(MqttDeviceStatusEvent event) {
        MqttDeviceStatusPayload payload = event.payload();
        espStatusService.markSeen();
        if (!"LED_GREEN".equals(payload.device()) && !"LED_RED".equals(payload.device())) return;
        Device device = deviceRepository.findByDeviceNameAndDeletedFalse(payload.device()).orElse(null);
        if (device == null) return;
        DeviceStatus status = "ON".equals(payload.status()) ? DeviceStatus.ON
                : "OFF".equals(payload.status()) ? DeviceStatus.OFF : DeviceStatus.UNKNOWN;
        device.setCurrentStatus(status);
        if (status != DeviceStatus.UNKNOWN) {
            DeviceActionType action = status == DeviceStatus.ON ? DeviceActionType.ON : DeviceActionType.OFF;
            actionHistoryRepository.findFirstByDevice_IdAndActionAndStatusOrderByCreatedAtDesc(
                    device.getId(), action, ActionStatus.PENDING).ifPresent(history -> history.setStatus(ActionStatus.SUCCESS));
        }
        DeviceStatusResponse response = toResponse(device);
        messagingTemplate.convertAndSend("/topic/device-status", response);
    }

    /**
     * Record a delivery failure on an already committed PENDING row. Runs in its own
     * transaction so it commits independently from the failed command flow.
     */
    private void markActionFailed(ActionHistory history, UUID userId) {
        if (history == null || history.getId() == null) return;
        inNewTransaction(() -> actionHistoryRepository.findById(history.getId()).ifPresentOrElse(stored -> {
            stored.setStatus(ActionStatus.FAILED);
            stored.setUpdatedBy(userId);
        }, () -> log.warn("Audit row {} disappeared before it could be marked FAILED", history.getId())));
    }

    private <T> T inNewTransaction(java.util.function.Supplier<T> action) {
        TransactionTemplate template = new TransactionTemplate(transactionManager);
        template.setPropagationBehavior(TransactionTemplate.PROPAGATION_REQUIRES_NEW);
        return template.execute(status -> action.get());
    }

    private void inNewTransaction(Runnable action) {
        inNewTransaction(() -> {
            action.run();
            return null;
        });
    }

    private DeviceStatusResponse toResponse(Device device) {
        return new DeviceStatusResponse(toDeviceKey(device.getDeviceName()), device.getCurrentStatus() == DeviceStatus.ON,
                device.getCurrentStatus().name());
    }

    private static String toDeviceName(String deviceKey) {
        return switch (deviceKey) {
            case "ledGreen" -> "LED_GREEN";
            case "ledRed" -> "LED_RED";
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported device key.");
        };
    }

    private static String toDeviceKey(String deviceName) {
        return switch (deviceName) {
            case "LED_GREEN" -> "ledGreen";
            case "LED_RED" -> "ledRed";
            default -> deviceName;
        };
    }

    private static String toCommand(String deviceName, boolean targetState) {
        return ("LED_GREEN".equals(deviceName) ? "GREEN" : "RED") + (targetState ? "_ON" : "_OFF");
    }
}
