package com.iot.ptit.custom.service.mqtt;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.mqtt")
public record MqttProperties(
        String brokerUrl,
        String clientId,
        String username,
        String password,
        String telemetryTopic,
        String deviceCommandTopic,
        String deviceStatusTopic
) {
}
