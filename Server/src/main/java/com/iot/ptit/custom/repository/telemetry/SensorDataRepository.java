package com.iot.ptit.custom.repository.telemetry;

import com.iot.ptit.custom.entity.telemetry.SensorData;
import com.iot.ptit.custom.enums.SensorType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.UUID;

public interface SensorDataRepository extends JpaRepository<SensorData, UUID>, JpaSpecificationExecutor<SensorData> {
    List<SensorData> findBySensorSensorTypeAndSensorDeletedFalseOrderByRecordedAtDesc(SensorType sensorType, Pageable pageable);

    /**
     * Paginated history query for the Sensor Data page.
     *
     * <p>Uses the inherited {@code findAll(Specification, Pageable)} contract. The owning
     * sensor is read lazily inside the {@code @Transactional} query service, which keeps
     * the filters intact (an {@code @EntityGraph} on a derived method silently ignored the
     * specification) and still avoids the N+1 problem.</p>
     */
    default Page<SensorData> findAllFiltered(Specification<SensorData> specification, Pageable pageable) {
        return findAll(specification, pageable);
    }
}
