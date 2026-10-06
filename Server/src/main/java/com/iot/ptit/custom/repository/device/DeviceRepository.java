package com.iot.ptit.custom.repository.device;

import com.iot.ptit.custom.entity.device.Device;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DeviceRepository extends JpaRepository<Device, UUID> {
    Optional<Device> findByDeviceNameAndDeletedFalse(String deviceName);
    List<Device> findAllByDeletedFalseOrderByDeviceNameAsc();
}
