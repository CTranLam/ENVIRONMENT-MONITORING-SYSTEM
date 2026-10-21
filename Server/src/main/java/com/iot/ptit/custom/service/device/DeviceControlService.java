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
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class DeviceControlService {
    private static final Duration ACK_TIMEOUT = Duration.ofSeconds(12);
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

    public DeviceStatusResponse command(UUID userId, DeviceControlRequest request) {
        String deviceName = toDeviceName(request.deviceKey());
        DeviceActionType action = request.targetState() ? DeviceActionType.ON : DeviceActionType.OFF;


        ActionHistory history = inNewTransaction(() -> {
            Device device = deviceRepository.findByDeviceNameAndDeletedFalse(deviceName)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Device was not found."));
            AppUser user = appUserRepository.findById(userId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User account was not found."));
            return actionHistoryRepository.save(new ActionHistory(device, user, action, ActionTrigger.MANUAL));
        });

        try {
            mqttClient.publishDeviceCommand(toCommand(deviceName, request.targetState()));
        } catch (RuntimeException exception) {
            markActionFailed(history, userId);
            log.error("Could not publish MQTT command for {} ({}): {}",
                    deviceName, request.deviceKey(), exception.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "The device command could not be delivered to the MQTT broker.");
        }

        return new DeviceStatusResponse(request.deviceKey(), request.targetState(), ActionStatus.PENDING.name());
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
        markAcknowledgedActionSuccessful(device, payload, status);
        DeviceStatusResponse response = toResponse(device);
        messagingTemplate.convertAndSend("/topic/device-status", response);
    }


    private void markAcknowledgedActionSuccessful(
            Device device,
            MqttDeviceStatusPayload payload,
            DeviceStatus deviceStatus
    ) {
        DeviceActionType action = acknowledgedAction(payload, deviceStatus);
        if (action == null) {
            return;
        }
        actionHistoryRepository
                .findFirstByDevice_IdAndActionAndStatusOrderByActionAtDesc(
                        device.getId(), action, ActionStatus.PENDING)
                .ifPresent(history -> history.setStatus(ActionStatus.SUCCESS));
    }

    private DeviceActionType acknowledgedAction(MqttDeviceStatusPayload payload, DeviceStatus deviceStatus) {
        if ("TURN_ON".equals(payload.action()) && deviceStatus == DeviceStatus.ON) {
            return DeviceActionType.ON;
        }
        if ("TURN_OFF".equals(payload.action()) && deviceStatus == DeviceStatus.OFF) {
            return DeviceActionType.OFF;
        }
        return null;
    }

    /** Marks commands failed when an ESP acknowledgement does not arrive within 12 seconds. */
    @Scheduled(fixedDelay = 3000)
    @Transactional
    public void failExpiredPendingActions() {
        Instant cutoff = Instant.now().minus(ACK_TIMEOUT);
        actionHistoryRepository.findAllByStatusAndActionAtBefore(ActionStatus.PENDING, cutoff)
                .forEach(history -> history.setStatus(ActionStatus.FAILED));
    }

    /**
     * Record a delivery failure on an already committed audit row. Runs in its own
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
