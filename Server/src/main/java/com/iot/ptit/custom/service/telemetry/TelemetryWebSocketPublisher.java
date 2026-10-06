package com.iot.ptit.custom.service.telemetry;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class TelemetryWebSocketPublisher {
    private final SimpMessagingTemplate messagingTemplate;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void publish(TelemetryReceivedEvent event) {
        messagingTemplate.convertAndSend("/topic/telemetry", event.message());
    }
}
