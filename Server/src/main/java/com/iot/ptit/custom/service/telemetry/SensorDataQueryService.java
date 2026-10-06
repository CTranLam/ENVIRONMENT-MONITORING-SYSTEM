package com.iot.ptit.custom.service.telemetry;

import com.iot.ptit.custom.dto.telemetry.PaginatedSensorDataResponse;
import com.iot.ptit.custom.dto.telemetry.SensorDataRecordResponse;
import com.iot.ptit.custom.entity.telemetry.Sensor;
import com.iot.ptit.custom.entity.telemetry.SensorData;
import com.iot.ptit.custom.enums.SensorType;
import com.iot.ptit.custom.repository.telemetry.SensorDataRepository;
import com.iot.ptit.custom.repository.telemetry.SensorRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Read-only query service backing the Sensor Data history page.
 *
 * <p>Replaces the mock data engine that previously lived in the web client: every filter
 * (search, metric type, time range), sort key and page is translated into a single
 * paginated database query.</p>
 */
@Service
@RequiredArgsConstructor
public class SensorDataQueryService {
    private static final int MAX_PAGE_SIZE = 100;

    /** Sort keys accepted from the web client, mapped to entity paths. */
    private static final Map<String, String> SORT_PATHS = Map.of(
            "id", "id",
            "name", "sensor.sensorName",
            "value", "value",
            "timestamp", "recordedAt");

    private final SensorDataRepository sensorDataRepository;
    private final SensorRepository sensorRepository;

    @Transactional(readOnly = true)
    public PaginatedSensorDataResponse getHistory(
            String search,
            String type,
            Instant startTime,
            Instant endTime,
            String sortBy,
            String sortOrder,
            int page,
            int pageSize
    ) {
        int safePage = Math.max(page, 1);
        int safePageSize = Math.clamp(pageSize, 1, MAX_PAGE_SIZE);

        Specification<SensorData> specification = buildSpecification(search, parseSensorType(type), startTime, endTime);
        Pageable pageable = PageRequest.of(safePage - 1, safePageSize, buildSort(sortBy, sortOrder));

        Page<SensorData> result = sensorDataRepository.findAllFiltered(specification, pageable);
        List<SensorData> rows = result.getContent();

        // Load every referenced sensor in one query instead of one per row (N+1).
        List<UUID> sensorIds = rows.stream()
                .map(row -> row.getSensor().getId())
                .distinct()
                .toList();
        Map<UUID, Sensor> sensorsById = sensorIds.isEmpty()
                ? Map.of()
                : sensorRepository.findAllById(sensorIds).stream()
                        .collect(Collectors.toMap(Sensor::getId, Function.identity()));

        List<SensorDataRecordResponse> items = rows.stream()
                .map(row -> toResponse(row, sensorsById.get(row.getSensor().getId())))
                .toList();

        return PaginatedSensorDataResponse.of(
                items,
                result.getTotalElements(),
                safePage,
                safePageSize);
    }

    private Specification<SensorData> buildSpecification(
            String search,
            SensorType sensorType,
            Instant startTime,
            Instant endTime
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Only ever expose telemetry of sensors that have not been soft-deleted.
            predicates.add(criteriaBuilder.isFalse(root.get("sensor").get("deleted")));

            if (search != null && !search.isBlank()) {
                String trimmed = search.trim();
                String pattern = "%" + trimmed.toLowerCase(Locale.ROOT) + "%";
                Predicate byName = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("sensor").get("sensorName")), pattern);

                // UUID input matches the primary key exactly rather than being cast to text,
                // which keeps the query portable between PostgreSQL and the H2 test profile.
                UUID searchId = parseUuid(trimmed);
                if (searchId != null) {
                    predicates.add(criteriaBuilder.or(byName, criteriaBuilder.equal(root.get("id"), searchId)));
                } else {
                    predicates.add(byName);
                }
            }
            if (sensorType != null) {
                predicates.add(criteriaBuilder.equal(root.get("sensor").get("sensorType"), sensorType));
            }
            if (startTime != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("recordedAt"), startTime));
            }
            if (endTime != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("recordedAt"), endTime));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Mirrors the client sort keys ({@code timestamp_desc}, {@code value_asc}, ...) and
     * falls back to newest-first for anything unknown.
     */
    private Sort buildSort(String sortBy, String sortOrder) {
        String path = SORT_PATHS.getOrDefault(
                sortBy == null ? "" : sortBy.trim().toLowerCase(Locale.ROOT),
                "recordedAt");
        Sort.Direction direction = "asc".equalsIgnoreCase(sortOrder) ? Sort.Direction.ASC : Sort.Direction.DESC;
        // Secondary key keeps pagination stable when the primary value ties (the three
        // metrics of one telemetry batch share the exact same recordedAt).
        Sort primary = Sort.by(direction, path);
        return "recordedAt".equals(path) ? primary : primary.and(Sort.by(Sort.Direction.DESC, "recordedAt"));
    }

    /** Accepts both the backend enum name ({@code TEMPERATURE}) and the client key ({@code temperature}). */
    private SensorType parseSensorType(String type) {
        if (type == null || type.isBlank() || "all".equalsIgnoreCase(type.trim())) {
            return null;
        }
        try {
            return SensorType.valueOf(type.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

    private UUID parseUuid(String value) {
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

    private SensorDataRecordResponse toResponse(SensorData data, Sensor sensor) {
        return new SensorDataRecordResponse(
                data.getId(),
                sensor.getSensorName(),
                sensor.getSensorType().name(),
                data.getValue(),
                sensor.getUnit(),
                data.getRecordedAt());
    }
}
