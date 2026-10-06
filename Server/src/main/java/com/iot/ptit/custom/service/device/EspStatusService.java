package com.iot.ptit.custom.service.device;

import com.iot.ptit.custom.dto.device.EspStatusResponse;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

@Service
public class EspStatusService {
    private static final Duration OFFLINE_AFTER = Duration.ofSeconds(12);
    private final SimpMessagingTemplate messagingTemplate;
    private volatile Instant lastSeenAt;
    private volatile boolean online;

    public EspStatusService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void markSeen() {
        lastSeenAt = Instant.now();
        publishIfChanged(true);
    }

    public EspStatusResponse getStatus() {
        boolean currentOnline = lastSeenAt != null && Duration.between(lastSeenAt, Instant.now()).compareTo(OFFLINE_AFTER) <= 0;
        return new EspStatusResponse(currentOnline, lastSeenAt);
    }

    @Scheduled(fixedRate = 3000)
    public void detectOffline() {
        publishIfChanged(getStatus().online());
    }

    private synchronized void publishIfChanged(boolean currentOnline) {
        if (online == currentOnline) return;
        online = currentOnline;
        messagingTemplate.convertAndSend("/topic/system-status", new EspStatusResponse(online, lastSeenAt));
    }
}
