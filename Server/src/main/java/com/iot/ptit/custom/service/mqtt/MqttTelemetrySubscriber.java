package com.iot.ptit.custom.service.mqtt;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.iot.ptit.custom.dto.telemetry.MqttTelemetryPayload;
import com.iot.ptit.custom.dto.device.MqttDeviceStatusPayload;
import com.iot.ptit.custom.service.device.EspStatusService;
import com.iot.ptit.custom.service.device.MqttDeviceStatusEvent;
import com.iot.ptit.custom.service.telemetry.TelemetryPersistenceService;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallbackExtended;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

@Component
@Slf4j
@EnableConfigurationProperties(MqttProperties.class)
public class MqttTelemetrySubscriber implements MqttCallbackExtended {
    private final MqttProperties properties;
    private final ObjectMapper objectMapper;
    private final TelemetryPersistenceService telemetryPersistenceService;
    private final EspStatusService espStatusService;
    private final ApplicationEventPublisher eventPublisher;
    private MqttClient client;

    public MqttTelemetrySubscriber(
            MqttProperties properties,
            ObjectMapper objectMapper,
            TelemetryPersistenceService telemetryPersistenceService,
            EspStatusService espStatusService,
            ApplicationEventPublisher eventPublisher
    ) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.telemetryPersistenceService = telemetryPersistenceService;
        this.espStatusService = espStatusService;
        this.eventPublisher = eventPublisher;
    }

    @Scheduled(fixedDelay = 5000)
    public synchronized void connectIfNeeded() {
        try {
            if (client == null) {
                client = new MqttClient(properties.brokerUrl(), properties.clientId(), new MemoryPersistence());
                client.setCallback(this);
            }
            if (!client.isConnected()) {
                MqttConnectOptions options = new MqttConnectOptions();
                options.setAutomaticReconnect(true);
                options.setCleanSession(true);
                options.setConnectionTimeout(5);
                if (properties.username() != null && !properties.username().isBlank()) {
                    options.setUserName(properties.username());
                    options.setPassword(properties.password() == null ? new char[0] : properties.password().toCharArray());
                }
                client.connect(options);
                subscribe();
                log.info("Connected to MQTT broker {} and subscribed to telemetry/device status", properties.brokerUrl());
            }
        } catch (MqttException exception) {
            log.warn(
                    "MQTT broker is unavailable at {} (reason code {}): {}",
                    properties.brokerUrl(),
                    exception.getReasonCode(),
                    exception.getMessage());
        }
    }

    @Override
    public void connectComplete(boolean reconnect, String serverUri) {
        if (reconnect) {
            try {
                subscribe();
                log.info("Reconnected to MQTT broker {}", serverUri);
            } catch (MqttException exception) {
                log.warn("Could not resubscribe to MQTT telemetry topic: {}", exception.getMessage());
            }
        }
    }

    @Override
    public void connectionLost(Throwable cause) {
        log.warn("MQTT connection lost: {}", cause == null ? "unknown reason" : cause.getMessage());
    }

    @Override
    public void messageArrived(String topic, MqttMessage message) {
        try {
            String body = new String(message.getPayload(), StandardCharsets.UTF_8);
            if (properties.telemetryTopic().equals(topic)) {
                MqttTelemetryPayload payload = objectMapper.readValue(body, MqttTelemetryPayload.class);
                telemetryPersistenceService.persist(payload);
                espStatusService.markSeen();
            } else if (properties.deviceStatusTopic().equals(topic)) {
                MqttDeviceStatusPayload payload = objectMapper.readValue(body, MqttDeviceStatusPayload.class);
                eventPublisher.publishEvent(new MqttDeviceStatusEvent(payload));
            }
        } catch (JsonProcessingException | IllegalArgumentException exception) {
            log.warn("Ignored invalid telemetry message on {}: {}", topic, exception.getMessage());
        } catch (RuntimeException exception) {
            log.error("Could not persist telemetry message from {}", topic, exception);
        }
    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken token) {
        // Commands are fire-and-forget; ESP acknowledges them on the status topic.
    }

    @PreDestroy
    public synchronized void disconnect() {
        if (client == null) {
            return;
        }
        try {
            client.disconnect();
            client.close();
        } catch (MqttException exception) {
            log.debug("MQTT client could not close cleanly", exception);
        }
    }

    private void subscribe() throws MqttException {
        client.subscribe(properties.telemetryTopic(), 1);
        client.subscribe(properties.deviceStatusTopic(), 1);
    }

    public synchronized void publishDeviceCommand(String command) {
        try {
            if (client == null || !client.isConnected()) {
                throw new IllegalStateException("MQTT is not connected.");
            }
            client.publish(properties.deviceCommandTopic(), new MqttMessage(command.getBytes(StandardCharsets.UTF_8)));
        } catch (MqttException exception) {
            throw new IllegalStateException("Could not publish device command.", exception);
        }
    }
}
