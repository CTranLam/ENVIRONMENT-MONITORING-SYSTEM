package com.iot.ptit.custom.security;

import com.iot.ptit.custom.entity.auth.AppUser;
import com.iot.ptit.custom.entity.auth.UserPermission;
import com.iot.ptit.custom.repository.auth.AppUserRepository;
import com.iot.ptit.custom.repository.auth.UserPermissionRepository;
import com.iot.ptit.custom.repository.device.ActionHistoryRepository;
import com.iot.ptit.custom.service.auth.UserPermissionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityIntegrationTests {
    private static final String EMAIL = "admin@example.com";
    private static final String PASSWORD = "correct-password";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private UserPermissionRepository userPermissionRepository;

    @Autowired
    private UserPermissionService userPermissionService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ActionHistoryRepository actionHistoryRepository;

    @BeforeEach
    void setUp() {
        // action_history references users, so it must be cleared before them.
        actionHistoryRepository.deleteAll();
        userPermissionRepository.deleteAll();
        appUserRepository.deleteAll();
        AppUser user = appUserRepository.save(new AppUser(
                "System Administrator",
                "B23DCCN480",
                "D23CQCN01-B",
                EMAIL,
                passwordEncoder.encode(PASSWORD)
        ));
        userPermissionRepository.save(new UserPermission(user, Permission.DEVICE_CONTROL));
    }

    @Test
    void rejectsRequestsWithoutAccessToken() throws Exception {
        mockMvc.perform(get("/api/not-created-yet"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void exposesOpenApiSpecificationWithoutAnAccessToken() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.info.title").value("Environment Monitoring System API"));
    }

    @Test
    void loginIssuesBearerTokenAndReturnsDatabasePermissions() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content("{\"email\":\"admin@example.com\",\"password\":\"correct-password\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.permissions[0]").value(Permission.DEVICE_CONTROL));
    }

    @Test
    void acceptsValidTokenAndLoadsAuthoritiesFromUserPermission() throws Exception {
        MvcResult login = mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content("{\"email\":\"admin@example.com\",\"password\":\"correct-password\"}"))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = login.getResponse().getContentAsString();
        String token = responseBody.replaceFirst(".*\\\"accessToken\\\":\\\"([^\\\"]+)\\\".*", "$1");

        mockMvc.perform(get("/api/not-created-yet").header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());

        assertThat(userPermissionService.findAuthoritiesByUserId(
                appUserRepository.findByEmailIgnoreCase(EMAIL).orElseThrow().getId()))
                .extracting(authority -> authority.getAuthority())
                .containsExactly(Permission.DEVICE_CONTROL);
    }

    @Test
    void registersUuidV7AccountAndLetsItReadAndUpdateItsProfile() throws Exception {
        MvcResult registration = mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content("""
                                {"fullName":"Profile User","studentId":"B23DCCN999","className":"D23CQCN01-B","email":"profile@example.com","password":"password-123"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.profile.fullName").value("Profile User"))
                .andReturn();

        String token = registration.getResponse().getContentAsString()
                .replaceFirst(".*\\\"accessToken\\\":\\\"([^\\\"]+)\\\".*", "$1");
        AppUser user = appUserRepository.findByEmailIgnoreCase("profile@example.com").orElseThrow();
        assertThat(user.getId().version()).isEqualTo(7);

        mockMvc.perform(get("/api/profile/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(user.getId().toString()));

        mockMvc.perform(put("/api/profile/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType("application/json")
                        .content("{\"location\":\"Hanoi, Vietnam\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.location").value("Hanoi, Vietnam"));
    }
}
