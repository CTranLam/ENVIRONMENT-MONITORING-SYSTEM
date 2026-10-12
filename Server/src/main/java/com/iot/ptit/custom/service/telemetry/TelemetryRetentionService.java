package com.iot.ptit.custom.service.telemetry;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

/** Removes raw telemetry after its configured retention period. */
@Service
@Slf4j
@RequiredArgsConstructor
@EnableConfigurationProperties(TelemetryRetentionProperties.class)
public class TelemetryRetentionService {
    private final TelemetryRetentionProperties properties;
    private final TelemetryRetentionBatchService batchService;

    @Scheduled(cron = "${app.telemetry.retention.cleanup-cron}", zone = "${app.telemetry.retention.cleanup-zone}")
    public void purgeExpiredTelemetry() {
        purgeExpiredTelemetry(Instant.now());
    }

    /**
     * Deletes telemetry strictly older than the retention cutoff. Exposed with an explicit
     * clock value so the boundary behaviour is deterministic in tests.
     *
     * @return number of deleted telemetry rows
     */
    public int purgeExpiredTelemetry(Instant now) {
        Instant cutoff = now.minus(properties.days(), ChronoUnit.DAYS);
        int deleted = 0;
        int deletedInBatch;
        do {
            deletedInBatch = batchService.deleteExpiredBatch(cutoff, properties.cleanupBatchSize());
            deleted += deletedInBatch;
        } while (deletedInBatch == properties.cleanupBatchSize());

        if (deleted > 0) {
            log.info("Deleted {} raw sensor telemetry rows recorded before {}.", deleted, cutoff);
        }
        return deleted;
    }
}
