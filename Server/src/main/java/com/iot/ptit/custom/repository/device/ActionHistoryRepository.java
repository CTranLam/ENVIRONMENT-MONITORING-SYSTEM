package com.iot.ptit.custom.repository.device;

import com.iot.ptit.custom.entity.actionhistory.ActionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface ActionHistoryRepository
        extends JpaRepository<ActionHistory, UUID>, JpaSpecificationExecutor<ActionHistory> {
}
