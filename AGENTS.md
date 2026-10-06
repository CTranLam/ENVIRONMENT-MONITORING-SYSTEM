# AGENTS.md — Master Architecture & Engineering Guide

Tài liệu này là cẩm nang toàn diện và quy chuẩn kỹ thuật bắt buộc cho toàn bộ hệ thống **Environment Monitoring System (EMS)**. Mọi Agent / AI hoặc kỹ sư khi phát triển, bảo trì, sinh mã (generate code) hoặc tái cấu trúc (refactor) trong toàn bộ kho mã nguồn này **BẮT BUỘC** phải đọc và tuân thủ các quy tắc dưới đây.

---

## 1. Tổng Quan Hệ Thống (System Overview)

* **Tên dự án:** Environment Monitoring System (EMS)
* **Mục tiêu:** Hệ thống IoT giám sát môi trường toàn diện theo thời gian thực (Nhiệt độ, Độ ẩm, Cường độ ánh sáng) và điều khiển từ xa hai thiết bị chấp hành (LED Green - D1, LED Red - D2), lưu trữ và truy vấn lịch sử đo lường cảm biến cùng lịch sử hành động điều khiển.
* **Tác giả:** Trần Quang Lâm — B23DCCN480 (PTIT)
* **Tài nguyên dự án:**
  - Figma Design: Giao diện chuẩn UI/UX
  - GitHub Repository: `https://github.com/CTranLam/ENVIRONMENT-MONITORING-SYSTEM`
  - Báo cáo bài tập lớn IoT: Microsoft Word Report

---

## 2. Cấu Trúc Monorepo & Phạm Vi Thư Mục (Workspace Structure)

```text
ENVIRONMENT-MONITORING-SYSTEM/
├── AGENTS.md                 # Tài liệu quy chuẩn tổng thể của toàn bộ repository (file này)
├── README.md                 # Hướng dẫn tổng quan dự án
├── Server/                   # Backend Spring Boot 4 / Java 21
│   ├── AGENTS.md             # Hướng dẫn riêng cho Backend
│   ├── docker-compose.yml    # Khởi chạy PostgreSQL, API và Mosquitto Broker
│   ├── build.gradle          # Cấu hình Gradle dependencies
│   ├── mosquitto/            # Cấu hình Mosquitto MQTT Broker
│   └── src/main/java/com/iot/ptit/
│       ├── base/             # Hạ tầng dùng chung (Security, Config, BaseEntity, Utils)
│       └── custom/           # Nghiệp vụ theo domain (Telemetry, Device, Auth, Profile)
├── Client-ui/                # Frontend chính thức (React 18 + TypeScript + Vite + Redux Toolkit)
│   ├── AGENTS.md             # Hướng dẫn riêng cho Frontend
│   ├── src/
│   │   ├── app/              # Redux store & typed hooks
│   │   ├── features/         # Feature-Based Architecture (dashboard, monitoring, action-history, alerts, profile)
│   │   ├── layouts/          # MainLayout (Header, Footer với trạng thái ESP8266)
│   │   ├── routes/           # Cấu hình AppRoutes
│   │   └── services/         # Axios apiClient cấu hình baseURL & JWT interceptor
├── Client/                   # [Legacy] Bản frontend cũ (tham khảo hoặc dự phòng, không chỉnh sửa)
```

---

## 3. Kiến Trúc Luồng Dữ Liệu IoT (End-to-End Data Flow)

Hệ thống được thiết kế theo mô hình 4 tầng tương tác khép kín:

```text
[Phần cứng: DHT11, Quang trở LDR, 2 LED]
                 │ ▲
                 ▼ │ (GPIO / ADC)
        [NodeMCU ESP8266]
          │             ▲
          │ (1) Publish │ (4) Subscribe Topic: home/led/control
          ▼             │
    [Eclipse Mosquitto MQTT Broker (Port 1883)]
          │             ▲
          │ (2) Consume │ (3) Publish Command
          ▼             │
     [Backend Spring Boot Server (Port 8080)]
          │             ▲
          │ STOMP WS    │ REST API (POST /api/devices/control)
          ▼             │
   [Frontend Client-ui (React 18 / Port 5173 - 8082)]
```

### 3.1. Chiều Đo lường Cảm biến (Sensor Telemetry Uplink)
1. ESP8266 định kỳ mỗi **3 giây** đọc cảm biến DHT11 (Chân D4) và Quang trở LDR (Chân A0).
2. ESP8266 đóng gói JSON và publish lên topic **`home/sensor/data`**:
   ```json
   {"temp": 28.5, "humidity": 65.0, "light": 450}
   ```
3. Backend `MqttTelemetrySubscriber` nhận tin:
   - Lưu vào bảng `sensor_data` qua `TelemetryPersistenceService`.
   - Cập nhật dấu thời gian sống `lastSeenAt` trong `EspStatusService`.
   - Phát sự kiện nội bộ `TelemetryReceivedEvent`.
4. `TelemetryWebSocketPublisher` đẩy dữ liệu qua STOMP WebSocket tới topic **`/topic/telemetry`**.
5. Frontend nhận tin, Redux dispatch `addSensorTelemetryPoint` cập nhật ngay lập tức 3 biểu đồ trượt mượt mà.

### 3.2. Chiều Điều khiển Thiết bị (Closed-Loop Device Control)
1. Người dùng gạt công tắc trên Web **Control Panel** (Switch chuyển sang trạng thái chờ `loading = true`).
2. Frontend gửi request HTTP `POST /api/devices/control` kèm Bearer JWT:
   ```json
   {"deviceKey": "ledGreen", "targetState": true}
   ```
3. Backend `DeviceControlService.command()`:
   - Lưu bản ghi mới vào bảng `action_history` với trạng thái ban đầu là `PENDING`.
   - Bắn chuỗi lệnh thô tương ứng sang MQTT topic **`home/led/control`**: `"GREEN_ON"`, `"GREEN_OFF"`, `"RED_ON"`, `"RED_OFF"`.
   - Trả về phản hồi `DeviceStatusResponse` cho HTTP request.
4. ESP8266 nhận lệnh qua callback MQTT:
   - Kích chân GPIO tương ứng (D1 cho Green, D2 cho Red).
   - **Bắt buộc gửi phản hồi ACK** lên topic **`home/led/status`**:
     ```json
     {"device": "LED_GREEN", "action": "TURN_ON", "status": "ON"}
     ```
5. Backend `MqttTelemetrySubscriber` nhận gói tin status:
   - Cập nhật trạng thái `current_status` trong bảng `devices`.
   - Cập nhật bản ghi `action_history` từ `PENDING` sang `SUCCESS`.
   - Bắn tin qua STOMP WebSocket tới topic **`/topic/device-status`**.
6. Frontend nhận tin qua WebSocket, Redux dispatch `setDeviceStatus`: công tắc dừng loading và chính thức chuyển màu sang trạng thái bật/tắt mới.

### 3.3. Giám sát Sống/Chết Thiết bị (ESP8266 Online/Offline Heartbeat)
* `EspStatusService` đặt ngưỡng timeout là **12 giây** (`OFFLINE_AFTER = 12s`).
* Mỗi 3 giây kiểm tra định kỳ: Nếu trong vòng 12 giây qua không có bất kỳ gói tin nào từ ESP8266 (telemetry hoặc status), Server đánh dấu `online = false` và broadcast qua WebSocket **`/topic/system-status`**.
* Footer trên giao diện Web tự động cập nhật:
  - **Online:** Chấm xanh nhấp nháy (`.status-dot-pulse`), nhãn `ESP8266: Online`.
  - **Offline:** Chấm đỏ ping animation, nhãn `ESP8266: Offline`.

---

## 4. Đặc Tả Cơ Sở Dữ Liệu & Entity (Database Standards)

Hệ thống sử dụng **PostgreSQL 16**, quản lý lược đồ tự động qua **Flyway Migrations** (`Server/src/main/resources/db/migration/`).

### 4.1. Quy ước Khóa Chính & Entity Kế Thừa
* Mọi entity cấu hình và nghiệp vụ (trừ dữ liệu chuỗi thời gian telemetry) **bắt buộc kế thừa `BaseEntity`**:
  - Khóa chính là **UUID v7** được sinh tự động ở tầng ứng dụng qua `UuidV7Generator.next()` trong `@PrePersist`.
  - Cung cấp sẵn các trường audit: `is_deleted` (soft-delete), `created_at`, `updated_at`, `created_by`, `updated_by`.
* Entity dùng `@Getter`, `@Setter` của Lombok. **Tuyệt đối không dùng `@Data`** trên JPA Entity để tránh lỗi đệ quy `hashCode/equals`.

### 4.2. Các Bảng Dữ Liệu Trọng Tâm

| Bảng | Entity | Mục đích | Ghi chú đặc biệt |
| :--- | :--- | :--- | :--- |
| `users` | `AppUser` | Người dùng & tài khoản quản trị | Role nhỏ (`ADMIN`, `OPERATOR`, `VIEWER`). Có liên kết hồ sơ profile. |
| `user_permission` | `UserPermission` | Phân quyền chi tiết | Lưu quyền cụ thể theo `user_id`. |
| `devices` | `Device` | Danh mục thiết bị chấp hành | Seed sẵn 2 thiết bị: `LED_GREEN` (D1) và `LED_RED` (D2). Cột `current_status` (`ON`, `OFF`, `UNKNOWN`). |
| `sensors` | `Sensor` | Danh mục cảm biến | Seed sẵn 3 cảm biến: `TEMPERATURE`, `HUMIDITY`, `LIGHT`. |
| `sensor_data` | `SensorData` | Dữ liệu đo đạc cảm biến | **Không kế thừa BaseEntity**, append-only time-series, đánh index `(sensor_id, recorded_at DESC)`. |
| `action_history` | `ActionHistory` | Lịch sử thao tác thiết bị | Lưu `device_id`, `user_id`, `action` (`ON`/`OFF`), `trigger_by` (`MANUAL`/`AUTOMATIC`), `status` (`PENDING`/`SUCCESS`/`FAILED`). |

---

## 5. Quy Chuẩn Kỹ Thuật Backend (Spring Boot 4 / Java 21)

### 5.1. Kiến Trúc Phân Tầng (Layered Architecture)
Mã nguồn đặt trong `com.iot.ptit`:
```text
com.iot.ptit/
  base/              # Reusable infrastructure (config, entity, exception, security)
  custom/            # Application logic theo domain
    controller/      # HTTP Rest Controllers (Validation, DTO mapping, HTTP Status)
    service/         # Business logic, @Transactional, điều phối luồng
    repository/      # Spring Data JPA Repositories
    entity/          # JPA Entities
    dto/             # Request / Response records
    enums/           # Toàn bộ enums chung (DeviceStatus, ActionStatus, SensorType,...)
```

### 5.2. Các Quy Tắc Bắt Buộc:
1. **Phân tách trách nhiệm:** Controller không bao giờ gọi trực tiếp Repository, phải qua Service. Controller không bao giờ trả về trực tiếp JPA Entity, phải dùng DTO.
2. **DTO là Java Record:** Mọi DTO dùng `record` bất biến, ví dụ `DeviceControlRequest`, `DeviceStatusResponse`.
3. **Bảo mật Stateless JWT:**
   - Public endpoints: `/api/auth/**`, `/actuator/health`, `/swagger-ui/**`, `/v3/api-docs/**`, `/ws/**`.
   - Mọi API nghiệp vụ còn lại đều yêu cầu Bearer JWT hợp lệ.
   - Luôn kiểm tra tài khoản còn active trong `JwtAuthenticationFilter`.
4. **Không đưa MQTT logic vào Controller:** Toàn bộ kết nối và gửi/nhận MQTT phải nằm trong `custom.service.mqtt.MqttTelemetrySubscriber`.

---

## 6. Quy Chuẩn Kỹ Thuật Frontend (React 18 + TypeScript + Vite)

Frontend chính thức nằm tại thư mục **`Client-ui/`**.

### 6.1. Kiến Trúc Feature-Based Architecture (FBA)
Toàn bộ mã nghiệp vụ chia theo feature trong `src/features/<feature-name>/`:
* `components/`: UI thuần túy (Presenter).
* `hooks/`: Custom Hook đóng gói toàn bộ logic và side effects (Container).
* `services/`: Axios HTTP API client.
* `slices/`: Redux Toolkit slice quản lý state.
* `types/`: Type definitions đồng bộ 100% với Backend DTOs.
* `index.ts`: Public API duy nhất của feature.

### 6.2. Các Quy Tắc Bắt Buộc:
1. **Không lạm dụng `useState`:** Toàn bộ state nghiệp vụ (telemetry, trạng thái LED, user profile, danh sách) phải nằm trong Redux Toolkit Slice.
2. **Luôn dùng Typed Hooks:** Dùng `useAppSelector` và `useAppDispatch` từ `@/app/hooks`.
3. **Tuyệt đối không dùng kiểu `any`:** Mọi biến, tham số, prop đều phải có TypeScript interface/type rõ ràng.
4. **Quy tắc Styling (Tailwind + Ant Design):**
   - Màu chủ đạo: `#0099FF` (Primary Blue).
   - Ant Design v5 tắt `preflight`, vì vậy mọi viền Tailwind phải chỉ định kiểu `solid`: `border border-solid border-slate-200`.
   - Không viết inline styles bừa bãi.
5. **Đồng bộ DTOs:** Phải khớp chính xác tên trường với Backend Java Record (ví dụ trường trạng thái thiết bị là `on: boolean`, không đặt nhầm thành `targetState`).

---

## 7. Quy Chuẩn Phần Cứng & Firmware (ESP8266 + Arduino C++)

* **Board:** NodeMCU v3 (ESP-12E / ESP8266).
* **Chân cắm chuẩn:**
  - `DHT11`: Chân Data nối GPIO 2 (D4).
  - `Quang trở LDR`: Chân Analog nối A0 (Đọc giá trị ADC `1023 - analogRead(A0)`).
  - `LED Green`: GPIO 5 (D1).
  - `LED Red`: GPIO 4 (D2).
* **Quy chuẩn Code Arduino:**
  - Luôn gọi `message.trim()` khi nhận lệnh MQTT từ Server.
  - Tự động kiểm tra và phục hồi Wi-Fi trong hàm `reconnect()` để tránh treo vòng lặp.
  - Đặt `client.setBufferSize(256)` để không bị tràn gói tin JSON.
  - Giữ chu kỳ gửi telemetry trong khoảng **3 giây** để đảm bảo không bị Server tính là timeout (12s).

---

## 8. Hướng Dẫn Vận Hành & Lệnh Triển Khai (Operations & Commands)

### 8.1. Khởi chạy bằng Docker Compose (Khuyên dùng)
```bash
# Khởi động toàn bộ hệ thống (PostgreSQL + Spring Boot Server + Mosquitto Broker):
cd Server
docker compose --profile mqtt up -d --build

# Kiểm tra trạng thái các container:
docker ps
```

### 8.2. Chạy Môi Trường Phát Triển Cục Bộ (Local Dev)
1. **Chạy Database PostgreSQL:**
   ```bash
   cd Server
   docker compose up -d postgres
   ```
2. **Chạy Backend:**
   ```bash
   cd Server
   ./gradlew bootRun
   # Kiểm tra Swagger UI: http://localhost:8080/swagger-ui.html
   ```
3. **Chạy Frontend:**
   ```bash
   cd Client-ui
   npm install
   npm run dev
   # Truy cập giao diện: http://localhost:5173
   ```
4. **Chạy Kiểm Thử Backend:**
   ```bash
   cd Server
   ./gradlew test
   ```

---

## 9. Kỷ Luật Sửa Đổi & Mở Rộng (Change Discipline)

1. Khi thêm thiết bị mới: Cập nhật migration Flyway `V...__add_device.sql`, enum `DeviceActionType`, logic mapping trong `DeviceControlService`, cập nhật `ControlPanel.tsx` và code Arduino.
2. Không chỉnh sửa các file Flyway migration đã chạy trên production hoặc commit trước đó; luôn tạo migration mới theo thứ tự phiên bản tiếp theo.
3. Luôn bảo tồn tài liệu, docstrings và comments giải thích logic phức tạp.
4. Cập nhật file `AGENTS.md` này bất cứ khi nào có thay đổi mang tính kiến trúc, giao thức truyền thông, hoặc cấu trúc database.

