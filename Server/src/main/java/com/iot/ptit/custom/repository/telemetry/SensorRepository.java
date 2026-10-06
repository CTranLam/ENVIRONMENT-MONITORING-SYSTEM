package com.iot.ptit.custom.repository.telemetry;

import com.iot.ptit.custom.entity.telemetry.Sensor;
import com.iot.ptit.custom.enums.SensorType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SensorRepository extends JpaRepository<Sensor, UUID> {
    Optional<Sensor> findBySensorTypeAndDeletedFalse(SensorType sensorType);
}
