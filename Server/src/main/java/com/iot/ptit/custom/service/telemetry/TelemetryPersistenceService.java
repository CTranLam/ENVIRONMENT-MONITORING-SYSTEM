package com.iot.ptit.custom.service.telemetry;

import com.iot.ptit.custom.dto.telemetry.MqttTelemetryPayload;
import com.iot.ptit.custom.dto.telemetry.TelemetryMessage;
import com.iot.ptit.custom.entity.telemetry.Sensor;
import com.iot.ptit.custom.entity.telemetry.SensorData;
import com.iot.ptit.custom.enums.SensorType;
import com.iot.ptit.custom.repository.telemetry.SensorDataRepository;
import com.iot.ptit.custom.repository.telemetry.SensorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TelemetryPersistenceService {
    private final SensorRepository sensorRepository;
    private final SensorDataRepository sensorDataRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void persist(MqttTelemetryPayload payload) {
        if (!payload.isValid()) {
            throw new IllegalArgumentException("Telemetry payload must contain finite temp, humidity, and light values.");
        }

        Sensor temperature = findSensor(SensorType.TEMPERATURE);
        Sensor humidity = findSensor(SensorType.HUMIDITY);
        Sensor light = findSensor(SensorType.LIGHT);
        Instant recordedAt = Instant.now();

        sensorDataRepository.saveAll(List.of(
                new SensorData(temperature, payload.temp(), recordedAt),
                new SensorData(humidity, payload.humidity(), recordedAt),
                new SensorData(light, payload.light(), recordedAt)
        ));

        eventPublisher.publishEvent(new TelemetryReceivedEvent(
                new TelemetryMessage(recordedAt, payload.temp(), payload.humidity(), payload.light())));
    }

    private Sensor findSensor(SensorType sensorType) {
        return sensorRepository.findBySensorTypeAndDeletedFalse(sensorType)
                .orElseThrow(() -> new IllegalStateException("Default sensor is missing: " + sensorType));
    }
}
