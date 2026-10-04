# Server Agent Guide

## Scope

This directory is the Spring Boot backend for Environment Monitoring System. Work in `Server/` only unless the user explicitly expands the scope. Do not modify the sibling `Client/` application. `Client-ui/` is a separate frontend and must only be changed when explicitly requested.

## Stack and commands

- Java 21, Spring Boot 4.1, Gradle Wrapper.
- PostgreSQL is the runtime database; Flyway owns its schema.
- H2 is test-only and uses the `test` Spring profile.
- Run all backend checks from this directory: `./gradlew test`.
- The application requires `JWT_SECRET`: a Base64-encoded secret with at least 256 bits. Do not commit secrets or a real `.env` file.
- Copy `.env.example` to `.env` for local Docker/PostgreSQL settings, then export it before `./gradlew bootRun`.
- Docker deploys through `docker-compose.yml` (PostgreSQL, backend API, and optional Mosquitto behind the `mqtt` profile). See `README.md` for the commands.
- Swagger UI: `http://localhost:8080/swagger-ui.html`; OpenAPI JSON: `http://localhost:8080/v3/api-docs`.

## Architecture

Keep the layered structure below. Package by layer first, then by domain.

```text
com.iot.ptit/
  base/                         # Reusable infrastructure only
    config/ dto/ entity/ exception/ security/ utils/
  custom/                       # Application-specific code
    controller/<domain>/
    service/<domain>/
    repository/<domain>/
    entity/<domain>/
    dto/<domain>/
    security/
```

- Controllers handle HTTP mapping, request validation, and response status only.
- Services contain business logic, transactions, and orchestration.
- Repositories contain JPA persistence queries only.
- Controllers must not access repositories directly.
- Use request/response DTOs at API boundaries; do not return JPA entities from controllers.

## Entities and database

- Most editable domain entities extend `base.entity.BaseEntity`, which supplies `id`, soft-delete state, audit actor IDs, and timestamps.
- `SensorData` is append-only telemetry. It intentionally does not extend `BaseEntity`; preserve `recordedAt` and avoid update/soft-delete workflows for this high-volume table.
- `AppUser` maps to `users`, not a separate `app_users` table.
- `UserPermission` references `users` through `user_id`; never grant permissions by a copied email string.
- `UserRole` is deliberately a small enum (`ADMIN`, `OPERATOR`, `VIEWER`). Effective API access is currently granted by direct `user_permission` rows, not a many-table role system.
- All shared enums belong in `custom.enums`. Do not recreate enums inside individual domain packages.
- Use Lombok `@Getter` and `@Setter` on entities. Do not use Lombok `@Data` on JPA entities.
- Schema changes require a new versioned migration in `src/main/resources/db/migration/` (for example, `V2__add_alert_configuration.sql`). Do not edit an already-applied Flyway migration.
- Add indexes for time-series queries, particularly filters by foreign key and timestamp.

## Security

- The API is stateless and uses Bearer JWT authentication.
- Only `/api/auth/**`, `/actuator/health`, `/swagger-ui.html`, `/swagger-ui/**`, and `/v3/api-docs/**` are public. Keep new APIs protected by default.
- `JwtAuthenticationFilter` validates the token, checks that the user remains active, then loads current authorities from `user_permission` for every request.
- Add permissions to `custom.security.Permission` and protect handlers with `@PreAuthorize`, for example:

  ```java
  @PreAuthorize("hasAuthority(@permission.DEVICE_CONTROL)")
  ```

- Preserve the JSON 401/403 responses from the existing security handlers.

## API documentation and tests

- Springdoc generates Swagger/OpenAPI from controllers. Add `@Tag`, `@Operation`, and response annotations when a controller becomes public-facing.
- Keep `/v3/api-docs` and Swagger UI reachable without a token for local testing unless the user requests a restricted documentation policy.
- Add or update tests for security rules, service behavior, validation, and new controller responses.
- Use the test profile/H2 for automated tests; do not require a local PostgreSQL instance to run `./gradlew test`.

## Change discipline

- Preserve user changes and unrelated files.
- Keep dependencies minimal and compatible with Spring Boot 4.
- Prefer constructor injection.
- Keep MQTT code under `custom.service.mqtt`; controllers must not publish MQTT messages directly.
- Update this file when architectural conventions, security behavior, or required commands materially change.
