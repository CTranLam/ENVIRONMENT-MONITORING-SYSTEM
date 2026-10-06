package com.iot.ptit.custom.telemetry;

import com.iot.ptit.custom.entity.auth.AppUser;
import com.iot.ptit.custom.entity.telemetry.Sensor;
import com.iot.ptit.custom.entity.telemetry.SensorData;
import com.iot.ptit.custom.enums.SensorType;
import com.iot.ptit.custom.repository.auth.AppUserRepository;
import com.iot.ptit.custom.repository.auth.UserPermissionRepository;
import com.iot.ptit.custom.repository.telemetry.SensorDataRepository;
import com.iot.ptit.custom.repository.telemetry.SensorRepository;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SensorDataHistoryIntegrationTests {
    private static final String EMAIL = "sensor.viewer@example.com";
    private static final String PASSWORD = "sensor-password";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SensorRepository sensorRepository;

    @Autowired
    private SensorDataRepository sensorDataRepository;

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private UserPermissionRepository userPermissionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String accessToken;
    private Sensor temperature;
    private Instant baseTime;

    @BeforeEach
    void setUp() throws Exception {
        sensorDataRepository.deleteAll();
        sensorRepository.deleteAll();
        // Permissions reference users, so they must be cleared first.
        userPermissionRepository.deleteAll();
        appUserRepository.deleteAll();

        appUserRepository.save(new AppUser(
                "Sensor Viewer", "B23DCCN999", "D23CQCN01-B", EMAIL, passwordEncoder.encode(PASSWORD)));

        temperature = sensorRepository.save(
                new Sensor("Temperature", SensorType.TEMPERATURE, "°C", "D4"));
        Sensor humidity = sensorRepository.save(
                new Sensor("Humidity", SensorType.HUMIDITY, "%", "D4"));

        // Millisecond precision matches what the web client sends (`Date.toISOString()`).
        baseTime = Instant.now().truncatedTo(ChronoUnit.MILLIS);
        sensorDataRepository.save(new SensorData(temperature, 29.4, baseTime.minusSeconds(120)));
        sensorDataRepository.save(new SensorData(temperature, 31.2, baseTime));
        sensorDataRepository.save(new SensorData(humidity, 73.0, baseTime));

        MvcResult login = mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content("{\"email\":\"" + EMAIL + "\",\"password\":\"" + PASSWORD + "\"}"))
                .andExpect(status().isOk())
                .andReturn();
        accessToken = com.jayway.jsonpath.JsonPath.read(login.getResponse().getContentAsString(), "$.accessToken");
    }

    @Test
    void returnsPersistedRowsWithPagingMetadata() throws Exception {
        mockMvc.perform(get("/api/sensors/history").header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(3))
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.pageSize").value(10))
                .andExpect(jsonPath("$.totalPages").value(1))
                // newest first by default
                .andExpect(jsonPath("$.items[0].sensorName").value("Temperature"))
                .andExpect(jsonPath("$.items[0].sensorType").value("TEMPERATURE"))
                .andExpect(jsonPath("$.items[0].value").value(31.2))
                .andExpect(jsonPath("$.items[0].unit").value("°C"))
                .andExpect(jsonPath("$.items[0].recordedAt").isNotEmpty())
                .andExpect(jsonPath("$.items[0].id").isNotEmpty());
    }

    @Test
    void paginatesResults() throws Exception {
        mockMvc.perform(get("/api/sensors/history")
                        .param("page", "2")
                        .param("pageSize", "2")
                        .param("sortBy", "timestamp")
                        .param("sortOrder", "desc")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(3))
                .andExpect(jsonPath("$.page").value(2))
                .andExpect(jsonPath("$.pageSize").value(2))
                .andExpect(jsonPath("$.totalPages").value(2))
                .andExpect(jsonPath("$.items.length()").value(1));
    }

    @Test
    void filtersBySensorType() throws Exception {
        mockMvc.perform(get("/api/sensors/history")
                        .param("type", "humidity")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.items[0].sensorName").value("Humidity"))
                .andExpect(jsonPath("$.items[0].sensorType").value("HUMIDITY"));
    }

    @Test
    void filtersByNameAndById() throws Exception {
        mockMvc.perform(get("/api/sensors/history")
                        .param("search", "temp")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(2));

        SensorData latest = sensorDataRepository.findAll().stream()
                .max((first, second) -> first.getRecordedAt().compareTo(second.getRecordedAt()))
                .orElseThrow();
        mockMvc.perform(get("/api/sensors/history")
                        .param("search", latest.getId().toString())
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.items[0].id").value(latest.getId().toString()));
    }

    @Test
    void filtersByTimeRange() throws Exception {
        mockMvc.perform(get("/api/sensors/history")
                        .param("startTime", baseTime.minusSeconds(60).toString())
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(2));
    }

    /** The date pickers send local wall-clock strings converted to UTC ISO-8601 with millis. */
    @Test
    void filtersByUtcIsoInstantWithMillis() throws Exception {
        mockMvc.perform(get("/api/sensors/history")
                        .param("startTime", baseTime.minusSeconds(60).toString())
                        .param("endTime", baseTime.plusSeconds(180).toString())
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                // The two rows written at `baseTime` are inside the window; the one from
                // two minutes earlier must be excluded by the lower bound.
                .andExpect(jsonPath("$.total").value(2));
    }

    @Test
    void rejectsMalformedTimestampParameter() throws Exception {
        mockMvc.perform(get("/api/sensors/history")
                        .param("startTime", "not-a-timestamp")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid value for parameter 'startTime'."));
    }

    @Test
    void sortsByValueAscending() throws Exception {
        mockMvc.perform(get("/api/sensors/history")
                        .param("sortBy", "value")
                        .param("sortOrder", "asc")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].value").value(29.4))
                .andExpect(jsonPath("$.items[2].value").value(73.0));
    }

    @Test
    void rejectsUnsupportedSensorType() throws Exception {
        mockMvc.perform(get("/api/sensors/history")
                        .param("type", "pressure")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rejectsRequestsWithoutAnAccessToken() throws Exception {
        mockMvc.perform(get("/api/sensors/history"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void excludesSoftDeletedSensors() throws Exception {
        temperature.setDeleted(true);
        sensorRepository.save(temperature);

        mockMvc.perform(get("/api/sensors/history").header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.items[0].sensorName").value("Humidity"));

        assertThat(sensorDataRepository.count()).isEqualTo(3);
    }
}
