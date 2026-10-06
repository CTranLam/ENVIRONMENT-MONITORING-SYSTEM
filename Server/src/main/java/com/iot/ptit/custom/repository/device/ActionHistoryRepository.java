package com.iot.ptit.custom.repository.device;

import com.iot.ptit.custom.entity.actionhistory.ActionHistory;
import com.iot.ptit.custom.enums.ActionStatus;
import com.iot.ptit.custom.enums.DeviceActionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ActionHistoryRepository extends JpaRepository<ActionHistory, UUID> {
    Optional<ActionHistory> findFirstByDevice_IdAndActionAndStatusOrderByCreatedAtDesc(
            UUID deviceId, DeviceActionType action, ActionStatus status);
}
