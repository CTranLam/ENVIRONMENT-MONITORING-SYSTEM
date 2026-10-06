package com.iot.ptit.custom.repository.telemetry;

import com.iot.ptit.custom.entity.telemetry.SensorData;
import com.iot.ptit.custom.enums.SensorType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SensorDataRepository extends JpaRepository<SensorData, UUID> {
    List<SensorData> findBySensorSensorTypeAndSensorDeletedFalseOrderByRecordedAtDesc(SensorType sensorType, Pageable pageable);
}
