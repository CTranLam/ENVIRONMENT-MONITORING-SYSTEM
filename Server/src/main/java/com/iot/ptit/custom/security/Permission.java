package com.iot.ptit.custom.security;

import org.springframework.stereotype.Component;

@Component("permission")
public final class Permission {
    public static final String DASHBOARD_VIEW = "dashboard:view";
    public static final String TELEMETRY_VIEW = "telemetry:view";
    public static final String DEVICE_CONTROL = "device:control";
    public static final String ALERT_MANAGE = "alert:manage";
    public static final String PROFILE_UPDATE = "profile:update";

    private Permission() {
    }
}
