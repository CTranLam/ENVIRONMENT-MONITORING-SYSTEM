package com.iot.ptit.custom.service.telemetry;

import com.iot.ptit.custom.dto.telemetry.DashboardTelemetryResponse;
import com.iot.ptit.custom.dto.telemetry.MetricPointResponse;
import com.iot.ptit.custom.entity.telemetry.SensorData;
import com.iot.ptit.custom.enums.SensorType;
import com.iot.ptit.custom.repository.telemetry.SensorDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardTelemetryService {
    private static final int MAX_LIMIT = 120;

    private final SensorDataRepository sensorDataRepository;

    @Transactional(readOnly = true)
    public DashboardTelemetryResponse getRecent(int requestedLimit) {
        int limit = Math.clamp(requestedLimit, 1, MAX_LIMIT);
        return new DashboardTelemetryResponse(
                getPoints(SensorType.TEMPERATURE, limit),
                getPoints(SensorType.HUMIDITY, limit),
                getPoints(SensorType.LIGHT, limit));
    }

    private List<MetricPointResponse> getPoints(SensorType sensorType, int limit) {
        return sensorDataRepository
                .findBySensorSensorTypeAndSensorDeletedFalseOrderByRecordedAtDesc(sensorType, PageRequest.of(0, limit))
                .stream()
                .sorted(Comparator.comparing(SensorData::getRecordedAt))
                .map(data -> new MetricPointResponse(data.getRecordedAt(), data.getValue()))
                .toList();
    }
}
