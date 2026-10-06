package com.iot.ptit.custom.telemetry;

import com.iot.ptit.custom.entity.actionhistory.ActionHistory;
import com.iot.ptit.custom.entity.auth.AppUser;
import com.iot.ptit.custom.entity.device.Device;
import com.iot.ptit.custom.enums.ActionStatus;
import com.iot.ptit.custom.enums.ActionTrigger;
import com.iot.ptit.custom.enums.DeviceActionType;
import com.iot.ptit.custom.repository.auth.AppUserRepository;
import com.iot.ptit.custom.repository.auth.UserPermissionRepository;
import com.iot.ptit.custom.repository.device.ActionHistoryRepository;
import com.iot.ptit.custom.repository.device.DeviceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import static com.jayway.jsonpath.JsonPath.read;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ActionHistoryIntegrationTests {
    private static final String EMAIL = "action.viewer@example.com";
    private static final String PASSWORD = "action-password";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ActionHistoryRepository actionHistoryRepository;

    @Autowired
    private UserPermissionRepository userPermissionRepository;

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String accessToken;
    private Device ledGreen;
    private Device ledRed;
    private Instant baseTime;

    @BeforeEach
    void setUp() throws Exception {
        // The suite shares one in-memory database, so clear the whole graph in FK order.
        actionHistoryRepository.deleteAll();
        deviceRepository.deleteAll();
        userPermissionRepository.deleteAll();
        appUserRepository.deleteAll();

        AppUser operator = appUserRepository.save(new AppUser(
                "Trần Quang Lâm", "B23DCCN480", "D23CQCN01-B", EMAIL, passwordEncoder.encode(PASSWORD)));

        ledGreen = deviceRepository.save(new Device("LED_GREEN", "D1"));
        ledRed = deviceRepository.save(new Device("LED_RED", "D2"));

        baseTime = Instant.now().truncatedTo(ChronoUnit.MILLIS);
        actionHistoryRepository.save(history(ledGreen, operator, DeviceActionType.ON, ActionStatus.SUCCESS, baseTime.minusSeconds(120)));
        actionHistoryRepository.save(history(ledGreen, operator, DeviceActionType.OFF, ActionStatus.SUCCESS, baseTime.minusSeconds(60)));
        actionHistoryRepository.save(history(ledRed, operator, DeviceActionType.ON, ActionStatus.PENDING, baseTime));

        MvcResult login = mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content("{\"email\":\"" + EMAIL + "\",\"password\":\"" + PASSWORD + "\"}"))
                .andExpect(status().isOk())
                .andReturn();
        accessToken = read(login.getResponse().getContentAsString(), "$.accessToken");
    }

    private ActionHistory history(Device device, AppUser user, DeviceActionType action, ActionStatus status, Instant actionAt) {
        ActionHistory entry = new ActionHistory(device, user, action, ActionTrigger.MANUAL);
        entry.setStatus(status);
        // Business timestamp. `createdAt` belongs to the audit columns and is rewritten by
        // JPA on insert, so it must not be used for history ordering.
        entry.setActionAt(actionAt);
        return entry;
    }

    @Test
    void returnsPersistedRowsNewestFirst() throws Exception {
        mockMvc.perform(get("/api/actions/history").header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(3))
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.pageSize").value(10))
                .andExpect(jsonPath("$.totalPages").value(1))
                .andExpect(jsonPath("$.items[0].device").value("LED Red"))
                .andExpect(jsonPath("$.items[0].deviceKey").value("ledRed"))
                .andExpect(jsonPath("$.items[0].action").value("ON"))
                .andExpect(jsonPath("$.items[0].status").value("PENDING"))
                .andExpect(jsonPath("$.items[0].sentBy").value("Trần Quang Lâm"))
                .andExpect(jsonPath("$.items[0].deviceId").value(ledRed.getId().toString()))
                .andExpect(jsonPath("$.items[0].timestamp").isNotEmpty());
    }

    @Test
    void paginatesResults() throws Exception {
        mockMvc.perform(get("/api/actions/history")
                        .param("page", "2")
                        .param("pageSize", "2")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(3))
                .andExpect(jsonPath("$.page").value(2))
                .andExpect(jsonPath("$.totalPages").value(2))
                .andExpect(jsonPath("$.items.length()").value(1));
    }

    @Test
    void filtersByDeviceKey() throws Exception {
        mockMvc.perform(get("/api/actions/history")
                        .param("device", "ledGreen")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(2))
                .andExpect(jsonPath("$.items[0].deviceKey").value("ledGreen"));
    }

    @Test
    void filtersByActionAndStatus() throws Exception {
        mockMvc.perform(get("/api/actions/history")
                        .param("action", "OFF")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.items[0].action").value("OFF"));

        mockMvc.perform(get("/api/actions/history")
                        .param("status", "PENDING")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.items[0].status").value("PENDING"));
    }

    @Test
    void searchesByDeviceNameActorAndUuid() throws Exception {
        mockMvc.perform(get("/api/actions/history")
                        .param("search", "red")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1));

        mockMvc.perform(get("/api/actions/history")
                        .param("search", "quang lâm")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(3));

        ActionHistory latest = actionHistoryRepository.findAll().stream()
                .max((first, second) -> first.getActionAt().compareTo(second.getActionAt()))
                .orElseThrow();
        mockMvc.perform(get("/api/actions/history")
                        .param("search", latest.getId().toString())
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.items[0].id").value(latest.getId().toString()));
    }

    @Test
    void filtersByTimeRange() throws Exception {
        // Rows sit at baseTime-120s, baseTime-60s and baseTime.
        // Lower bound only: keeps the two older rows.
        mockMvc.perform(get("/api/actions/history")
                        .param("startTime", baseTime.minusSeconds(90).toString())
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(2));

        // Closed window around the oldest row only.
        mockMvc.perform(get("/api/actions/history")
                        .param("startTime", baseTime.minusSeconds(180).toString())
                        .param("endTime", baseTime.minusSeconds(90).toString())
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1));

        // Upper bound only: excludes the newest row.
        mockMvc.perform(get("/api/actions/history")
                        .param("endTime", baseTime.minusSeconds(30).toString())
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(2));

        // Window entirely before the oldest row.
        mockMvc.perform(get("/api/actions/history")
                        .param("endTime", baseTime.minusSeconds(180).toString())
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(0));
    }

    @Test
    void sortsByDeviceAscending() throws Exception {
        mockMvc.perform(get("/api/actions/history")
                        .param("sortBy", "device")
                        .param("sortOrder", "asc")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].device").value("LED Green"))
                .andExpect(jsonPath("$.items[2].device").value("LED Red"));
    }

    @Test
    void rejectsUnsupportedDeviceKey() throws Exception {
        mockMvc.perform(get("/api/actions/history")
                        .param("device", "coolingFan")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rejectsRequestsWithoutAnAccessToken() throws Exception {
        mockMvc.perform(get("/api/actions/history"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void systemTriggeredRowsShowAsSystem() throws Exception {
        actionHistoryRepository.save(history(ledRed, null, DeviceActionType.OFF, ActionStatus.SUCCESS, baseTime.plusSeconds(5)));

        mockMvc.perform(get("/api/actions/history")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].sentBy").value("System"));
    }
}
