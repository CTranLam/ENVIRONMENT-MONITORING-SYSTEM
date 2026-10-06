package com.iot.ptit.custom.service.actionhistory;

import com.iot.ptit.custom.dto.actionhistory.ActionHistoryRecordResponse;
import com.iot.ptit.custom.dto.actionhistory.PaginatedActionHistoryResponse;
import com.iot.ptit.custom.entity.actionhistory.ActionHistory;
import com.iot.ptit.custom.entity.auth.AppUser;
import com.iot.ptit.custom.entity.device.Device;
import com.iot.ptit.custom.enums.ActionStatus;
import com.iot.ptit.custom.enums.DeviceActionType;
import com.iot.ptit.custom.repository.auth.AppUserRepository;
import com.iot.ptit.custom.repository.device.ActionHistoryRepository;
import com.iot.ptit.custom.repository.device.DeviceRepository;
import jakarta.persistence.criteria.JoinType;
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
import java.util.Objects;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Read-only query service backing the Action History page.
 *
 * <p>Replaces the mock data engine that previously lived in the web client: every filter
 * (search, device, action, status, time range), sort key and page is translated into a
 * single paginated query over {@code action_history}.</p>
 */
@Service
@RequiredArgsConstructor
public class ActionHistoryQueryService {
    private static final int MAX_PAGE_SIZE = 100;

    /** Sort keys accepted from the web client, mapped to entity paths. */
    private static final Map<String, String> SORT_PATHS = Map.of(
            "deviceId", "device.id",
            "device", "device.deviceName",
            "action", "action",
            "status", "status",
            "timestamp", "actionAt");

    /** UI device key per persisted device name. */
    private static final Map<String, String> DEVICE_KEYS = Map.of(
            "LED_GREEN", "ledGreen",
            "LED_RED", "ledRed");

    /** Human readable device label per persisted device name. */
    private static final Map<String, String> DEVICE_LABELS = Map.of(
            "LED_GREEN", "LED Green",
            "LED_RED", "LED Red");

    private final ActionHistoryRepository actionHistoryRepository;
    private final DeviceRepository deviceRepository;
    private final AppUserRepository appUserRepository;

    @Transactional(readOnly = true)
    public PaginatedActionHistoryResponse getHistory(
            String search,
            String deviceKey,
            String action,
            String status,
            Instant startTime,
            Instant endTime,
            String sortBy,
            String sortOrder,
            int page,
            int pageSize
    ) {
        int safePage = Math.max(page, 1);
        int safePageSize = Math.clamp(pageSize, 1, MAX_PAGE_SIZE);

        Specification<ActionHistory> specification = buildSpecification(
                search, parseDeviceName(deviceKey), parseAction(action), parseStatus(status), startTime, endTime);
        Pageable pageable = PageRequest.of(safePage - 1, safePageSize, buildSort(sortBy, sortOrder));

        Page<ActionHistory> result = actionHistoryRepository.findAll(specification, pageable);
        List<ActionHistory> rows = result.getContent();

        // Load the referenced devices and actors in two queries instead of one per row (N+1).
        List<UUID> deviceIds = rows.stream()
                .map(row -> row.getDevice().getId())
                .distinct()
                .toList();
        List<UUID> userIds = rows.stream()
                .map(row -> row.getUser() == null ? null : row.getUser().getId())
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        Map<UUID, Device> devicesById = deviceIds.isEmpty()
                ? Map.of()
                : deviceRepository.findAllById(deviceIds).stream()
                        .collect(Collectors.toMap(Device::getId, Function.identity()));
        Map<UUID, AppUser> usersById = userIds.isEmpty()
                ? Map.of()
                : appUserRepository.findAllById(userIds).stream()
                        .collect(Collectors.toMap(AppUser::getId, Function.identity()));

        List<ActionHistoryRecordResponse> items = rows.stream()
                .map(row -> toResponse(row, devicesById.get(row.getDevice().getId()),
                        row.getUser() == null ? null : usersById.get(row.getUser().getId())))
                .toList();

        return PaginatedActionHistoryResponse.of(items, result.getTotalElements(), safePage, safePageSize);
    }

    private Specification<ActionHistory> buildSpecification(
            String search,
            String deviceName,
            DeviceActionType action,
            ActionStatus status,
            Instant startTime,
            Instant endTime
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                String trimmed = search.trim();
                String pattern = "%" + trimmed.toLowerCase(Locale.ROOT) + "%";
                // The optional actor is joined for the "sent by" search; a LEFT join keeps
                // system triggered rows (user_id = NULL) visible.
                var userJoin = root.join("user", JoinType.LEFT);
                List<Predicate> searchPredicates = new ArrayList<>();
                searchPredicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("device").get("deviceName")), pattern));
                searchPredicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(userJoin.get("fullName")), pattern));

                // UUID input matches the primary key exactly instead of casting it to text.
                UUID searchId = parseUuid(trimmed);
                if (searchId != null) {
                    searchPredicates.add(criteriaBuilder.equal(root.get("id"), searchId));
                    searchPredicates.add(criteriaBuilder.equal(root.get("device").get("id"), searchId));
                }
                predicates.add(criteriaBuilder.or(searchPredicates.toArray(new Predicate[0])));
            }

            if (deviceName != null) {
                predicates.add(criteriaBuilder.equal(root.get("device").get("deviceName"), deviceName));
            }
            if (action != null) {
                predicates.add(criteriaBuilder.equal(root.get("action"), action));
            }
            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }
            if (startTime != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("actionAt"), startTime));
            }
            if (endTime != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("actionAt"), endTime));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Mirrors the client sort keys ({@code timestamp_desc}, {@code device_asc}, ...) and
     * falls back to newest-first for anything unknown.
     */
    private Sort buildSort(String sortBy, String sortOrder) {
        String path = SORT_PATHS.getOrDefault(
                sortBy == null ? "" : sortBy.trim(),
                "actionAt");
        Sort.Direction direction = "asc".equalsIgnoreCase(sortOrder) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Sort primary = Sort.by(direction, path);
        // Secondary key keeps pagination stable when the primary value ties.
        return "actionAt".equals(path) ? primary : primary.and(Sort.by(Sort.Direction.DESC, "actionAt"));
    }

    /** Accepts the UI key ({@code ledGreen}) and the persisted name ({@code LED_GREEN}). */
    private String parseDeviceName(String deviceKey) {
        if (deviceKey == null || deviceKey.isBlank() || "all".equalsIgnoreCase(deviceKey.trim())) {
            return null;
        }
        return switch (deviceKey.trim()) {
            case "ledGreen" -> "LED_GREEN";
            case "ledRed" -> "LED_RED";
            default -> deviceKey.trim().toUpperCase(Locale.ROOT);
        };
    }

    private DeviceActionType parseAction(String action) {
        if (action == null || action.isBlank() || "all".equalsIgnoreCase(action.trim())) {
            return null;
        }
        try {
            return DeviceActionType.valueOf(action.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

    private ActionStatus parseStatus(String status) {
        if (status == null || status.isBlank() || "all".equalsIgnoreCase(status.trim())) {
            return null;
        }
        try {
            return ActionStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
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

    private ActionHistoryRecordResponse toResponse(ActionHistory history, Device device, AppUser user) {
        String deviceName = device == null ? "UNKNOWN" : device.getDeviceName();
        UUID deviceId = device == null ? null : device.getId();
        String sentBy = user == null || user.getFullName() == null ? "System" : user.getFullName();

        return new ActionHistoryRecordResponse(
                history.getId(),
                deviceId,
                DEVICE_LABELS.getOrDefault(deviceName, deviceName),
                DEVICE_KEYS.getOrDefault(deviceName, deviceName.toLowerCase(Locale.ROOT)),
                history.getAction() == null ? null : history.getAction().name(),
                history.getStatus() == null ? null : history.getStatus().name(),
                history.getTriggerBy() == null ? null : history.getTriggerBy().name(),
                sentBy,
                history.getActionAt());
    }
}
