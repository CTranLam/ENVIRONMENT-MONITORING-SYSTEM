package com.iot.ptit.custom.entity.telemetry;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import com.iot.ptit.base.entity.UuidV7Generator;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "sensor_data", indexes = @Index(name = "idx_sensor_data_sensor_recorded_at", columnList = "sensor_id, recorded_at"))
@Getter
@Setter
public class SensorData {
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sensor_id", nullable = false)
    private Sensor sensor;

    // `value` is a reserved word in H2 (used by the test profile) and in some PostgreSQL
    // contexts, so the identifier is always quoted; the column name stays lowercase.
    @Column(name = "`value`", nullable = false)
    private Double value;

    @Column(name = "recorded_at", nullable = false, updatable = false)
    private Instant recordedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected SensorData() {
    }

    public SensorData(Sensor sensor, Double value, Instant recordedAt) {
        this.sensor = sensor;
        this.value = value;
        this.recordedAt = recordedAt;
    }

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UuidV7Generator.next();
        }
        if (recordedAt == null) {
            recordedAt = Instant.now();
        }
        createdAt = Instant.now();
    }

}
