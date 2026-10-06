# Environment Monitoring System — Server

## Run locally

1. Create a local environment file and replace the example JWT key before sharing or deploying it.

   ```bash
   cp .env.example .env
   ```

2. Start PostgreSQL.

   ```bash
   docker compose up -d
   ```

3. Export the variables for the Spring Boot process, then start the backend.

   ```bash
   set -a
   source .env
   set +a
   ./gradlew bootRun
   ```

Flyway automatically applies database migrations before Hibernate validates the entity mapping. Do not run migration SQL manually.

> The initial schema now uses application-generated UUID v7 keys for every primary and foreign key. If you created the previous `BIGINT` schema locally, reset the disposable local PostgreSQL volume before starting this version (`docker compose down -v`, then `docker compose up -d postgres`). Do not use that command for a database whose data must be retained.

## URLs

- API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- PostgreSQL: `localhost:5435` by default (override with `POSTGRES_PORT` and `DB_URL`).

## Database migrations

Migrations are stored in `src/main/resources/db/migration` and are versioned with Flyway.

- Before a migration has been applied anywhere, it may be edited.
- After it has been applied, create a new migration (for example `V2__add_alert_configuration.sql`) instead of changing the old one.
- To reset an unimportant local database, stop containers and remove the Compose volume:

  ```bash
  docker compose down -v
  ```

  This permanently deletes local PostgreSQL data.

## Tests

```bash
./gradlew test
```

Tests run against H2 with the `test` profile; they do not require Docker or PostgreSQL.

## Docker deployment

`docker-compose.yml` configures PostgreSQL, the backend API, and optional Mosquitto.

- To run only the database (for local `./gradlew bootRun`):
  ```bash
  docker compose up -d postgres
  ```

- To run the full stack (database + API):
  ```bash
  docker compose up -d --build
  ```

- `JWT_SECRET` can be configured in `.env`.
- PostgreSQL port is published at `5435:5432`.
- The API port is published on `${API_PORT:-8080}` for direct client and frontend access. Ensure CORS is configured for frontend origins via `CORS_ALLOWED_ORIGINS`.

### MQTT (optional)

Mosquitto sits behind the `mqtt` profile and does not start by default. It refuses anonymous connections, so create the password file first:

```bash
docker run --rm -it -v "$PWD/mosquitto:/mosquitto/config" eclipse-mosquitto:2 \
  mosquitto_passwd -c -b /mosquitto/config/passwd ems-backend '<password>'

docker compose --profile mqtt up -d
```

Put the same credentials in `.env.prod` as `MQTT_USERNAME` / `MQTT_PASSWORD`. Only the backend connects to the broker — the browser receives telemetry through the backend's WebSocket, never by speaking MQTT directly.
