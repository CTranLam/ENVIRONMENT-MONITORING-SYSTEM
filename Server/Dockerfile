# syntax=docker/dockerfile:1.7
#
# Production image for the Environment Monitoring System backend.
# Build context is Server/ :  docker build -t ems/server:latest .

FROM eclipse-temurin:21-jdk-jammy AS builder

WORKDIR /workspace

ENV GRADLE_OPTS="-Dorg.gradle.daemon=false" \
    GRADLE_USER_HOME=/root/.gradle

COPY gradlew ./
COPY gradle ./gradle
COPY settings.gradle build.gradle ./
RUN chmod +x gradlew

RUN --mount=type=cache,target=/root/.gradle,sharing=locked \
    ./gradlew --no-daemon --quiet dependencies --configuration runtimeClasspath

COPY src ./src

RUN --mount=type=cache,target=/root/.gradle,sharing=locked \
    ./gradlew --no-daemon clean bootJar -x test

FROM eclipse-temurin:21-jre-jammy AS runtime

RUN groupadd --system --gid 1001 app \
 && useradd --system --uid 1001 --gid app --home-dir /app --shell /usr/sbin/nologin app

WORKDIR /app

COPY --from=builder --chown=app:app /workspace/build/libs/*.jar app.jar

USER app

ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:InitialRAMPercentage=50 -XX:+ExitOnOutOfMemoryError"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
