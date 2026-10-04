package com.iot.ptit.custom.entity.telemetry;

import com.iot.ptit.base.entity.BaseEntity;
import com.iot.ptit.custom.enums.SensorType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "sensors")
@Getter
@Setter
public class Sensor extends BaseEntity {
    @Column(name = "sensor_name", nullable = false, unique = true, length = 50)
    private String sensorName;

    @Enumerated(EnumType.STRING)
    @Column(name = "sensor_type", nullable = false, length = 50)
    private SensorType sensorType;

    @Column(nullable = false, length = 10)
    private String unit;

    @Column(name = "pin_connected", nullable = false, length = 10)
    private String pinConnected;

    protected Sensor() {
    }

    public Sensor(String sensorName, SensorType sensorType, String unit, String pinConnected) {
        this.sensorName = sensorName;
        this.sensorType = sensorType;
        this.unit = unit;
        this.pinConnected = pinConnected;
    }

}
