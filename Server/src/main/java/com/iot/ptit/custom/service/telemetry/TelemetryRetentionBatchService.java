package com.iot.ptit.custom.service.telemetry;

import com.iot.ptit.custom.repository.telemetry.SensorDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/** Executes one short retention-delete transaction at a time. */
@Service
@RequiredArgsConstructor
class TelemetryRetentionBatchService {
    private final SensorDataRepository sensorDataRepository;

    @Transactional
    public int deleteExpiredBatch(Instant cutoff, int batchSize) {
        var expiredIds = sensorDataRepository.findExpiredIds(cutoff, PageRequest.of(0, batchSize));
        if (expiredIds.isEmpty()) {
            return 0;
        }

        sensorDataRepository.deleteAllByIdInBatch(expiredIds);
        return expiredIds.size();
    }
}
