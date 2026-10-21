package com.iot.ptit.custom.repository.device;

import com.iot.ptit.custom.entity.actionhistory.ActionHistory;
import com.iot.ptit.custom.enums.ActionStatus;
import com.iot.ptit.custom.enums.DeviceActionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface ActionHistoryRepository
        extends JpaRepository<ActionHistory, UUID>, JpaSpecificationExecutor<ActionHistory> {
    Optional<ActionHistory> findFirstByDevice_IdAndActionAndStatusOrderByActionAtDesc(
            UUID deviceId,
            DeviceActionType action,
            ActionStatus status
    );

    List<ActionHistory> findAllByStatusAndActionAtBefore(ActionStatus status, Instant cutoff);
}
