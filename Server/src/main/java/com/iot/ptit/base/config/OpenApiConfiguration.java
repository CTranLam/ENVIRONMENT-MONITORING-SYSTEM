package com.iot.ptit.base.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfiguration {
    private static final String BEARER_AUTH = "bearerAuth";

    @Bean
    public OpenAPI environmentMonitoringOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Environment Monitoring System API")
                        .version("v1")
                        .description("REST API for EMS. Except for Authentication endpoints, requests require a "
                                + "Bearer JWT. Realtime telemetry, device acknowledgements, and ESP status are "
                                + "delivered through authenticated STOMP WebSocket subscriptions at /ws."))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH))
                .components(new Components().addSecuritySchemes(BEARER_AUTH, new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")));
    }
}
