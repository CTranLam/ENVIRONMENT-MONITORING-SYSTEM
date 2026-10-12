# Environment Monitoring System (EMS)

Hệ thống IoT giám sát môi trường theo thời gian thực, thu thập nhiệt độ, độ ẩm và cường độ ánh sáng từ ESP8266; đồng thời điều khiển hai LED từ giao diện web. Dữ liệu được lưu vào PostgreSQL, truyền realtime qua MQTT và WebSocket, có lịch sử để tra cứu sau này.

**Tác giả:** Trần Quang Lâm — B23DCCN480 (PTIT)

## Mục lục

- [Chức năng](#chức-năng)
- [Kiến trúc](#kiến-trúc)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc mã nguồn](#cấu-trúc-mã-nguồn)
- [Yêu cầu môi trường](#yêu-cầu-môi-trường)
- [Khởi chạy nhanh bằng Docker](#khởi-chạy-nhanh-bằng-docker)
- [Phát triển cục bộ](#phát-triển-cục-bộ)
- [Cấu hình](#cấu-hình)
- [API và realtime](#api-và-realtime)
- [MQTT và phần cứng](#mqtt-và-phần-cứng)
- [Dữ liệu và chính sách lưu giữ](#dữ-liệu-và-chính-sách-lưu-giữ)
- [Kiểm thử](#kiểm-thử)

## Chức năng

- **Dashboard thời gian thực:** Hiển thị biểu đồ trượt mượt mà cho 3 thông số môi trường (Nhiệt độ, Độ ẩm, Cường độ ánh sáng) và giám sát nhịp tim (Heartbeat) trạng thái kết nối Online/Offline của ESP8266.
- **Điều khiển thiết bị khép kín (Closed-Loop Control):** Điều khiển **LED Green (D1/GPIO 5)** và **LED Red (D2/GPIO 4)**. Công tắc hiển thị trạng thái chờ `loading` khi gửi lệnh `PENDING`, và chỉ chính thức chuyển màu khi nhận được gói tin phản hồi ACK từ ESP8266 qua WebSocket.
- **Lịch sử đo đạc cảm biến (Sensor Data):** Truy vấn trực tiếp từ PostgreSQL, hỗ trợ phân trang, sắp xếp theo thời gian/giá trị, lọc theo loại cảm biến (Nhiệt độ, Độ ẩm, Ánh sáng), và tìm kiếm đa năng theo tên cảm biến / giá trị / thời gian.
- **Lịch sử thao tác thiết bị (Action History):** Truy vấn trực tiếp từ PostgreSQL, hỗ trợ phân trang, sắp xếp, lọc theo thiết bị (`LED_GREEN`, `LED_RED`), hành động (`ON`, `OFF`), trạng thái (`SUCCESS`, `FAILED`), và tìm kiếm theo mốc thời gian thao tác.
- **100% dữ liệu thật — Không còn mock fallback:** Loại bỏ hoàn toàn cơ chế mock data giả lập ở client. Mọi trang đều tương tác với database thật qua API; khi backend gặp sự cố, hệ thống hiển thị trạng thái lỗi rõ ràng thay vì dữ liệu giả.
- **Xác thực & Bảo mật người dùng:** Đăng ký, đăng nhập tài khoản bằng Stateless JWT, bảo vệ toàn bộ API nghiệp vụ và route phía client.
- **Hồ sơ cá nhân & Quản lý ảnh đại diện (Profile & MinIO):** Cập nhật thông tin sinh viên; upload ảnh đại diện hỗ trợ nén tự động ở client và lưu trữ tập trung tại MinIO Object Storage.
- **Tự động dọn dẹp dữ liệu (Retention 7 ngày):** Scheduled job định kỳ hằng ngày tự động dọn dẹp dữ liệu đo đạc thô (`sensor_data`) quá 7 ngày theo từng lô (batch) để tối ưu dung lượng cơ sở dữ liệu.

## Kiến trúc

```text
 DHT11 / LDR / LED D1-D2
            │ GPIO / ADC
            ▼
        ESP8266
            │ MQTT publish/subscribe
            ▼
      Mosquitto Broker
            │
            ▼
 Spring Boot API ───── PostgreSQL
            │                │
            │ STOMP/WebSocket│
            ▼                │
 React Client-ui ◄───────────┘
            │
            └──────── MinIO (ảnh đại diện)
```

Luồng telemetry: ESP8266 publish dữ liệu mỗi 3 giây lên MQTT → Server lưu ba bản ghi cảm biến → Server broadcast qua WebSocket → Dashboard cập nhật ngay.

Luồng điều khiển: Web gọi REST API → Server lưu lịch sử và publish lệnh MQTT → ESP8266 kích GPIO, gửi ACK → Server cập nhật trạng thái LED trong database và broadcast tới client.

## Công nghệ sử dụng

| Thành phần | Công nghệ |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Redux Toolkit, React Router, Ant Design, Tailwind CSS, STOMP.js |
| Backend | Java 21, Spring Boot 4, Spring Security, Spring Data JPA, Spring WebSocket, Spring Integration MQTT |
| Database | PostgreSQL 16, Flyway |
| Hạ tầng IoT | Eclipse Mosquitto, ESP8266/NodeMCU |
| Object storage | MinIO |
| Đóng gói | Docker Compose |

## Cấu trúc mã nguồn

```text
ENVIRONMENT-MONITORING-SYSTEM/
├── Client-ui/                         # Frontend chính thức React + TypeScript
│   ├── src/app/                       # Redux store và typed hooks
│   ├── src/features/                  # dashboard, monitoring, action-history, auth, profile
│   ├── src/layouts/                   # Header, footer, trạng thái ESP8266
│   └── src/services/                  # Axios client và JWT interceptor
├── Server/                            # Backend Spring Boot
│   ├── src/main/java/com/iot/ptit/
│   │   ├── base/                      # Security, config, exception, base entity
│   │   └── custom/                    # Controller, service, repository, DTO, entity theo domain
│   ├── src/main/resources/db/migration/# Flyway migrations
│   ├── mosquitto/                     # Cấu hình MQTT broker
│   └── docker-compose.yml             # PostgreSQL, API, MinIO, Mosquitto
└── AGENTS.md                          # Quy chuẩn kiến trúc và phát triển
```

## Yêu cầu môi trường

- Docker Engine và Docker Compose v2, nếu chạy bằng container.
- Java 21 và Node.js 18+, nếu chạy local.
- npm.
- ESP8266/NodeMCU, DHT11, LDR và 2 LED nếu kết nối với phần cứng thật.

## Khởi chạy nhanh bằng Docker

### 1. Khởi động backend, database, MinIO và MQTT

```bash
cd Server
cp .env.example .env
docker compose --profile mqtt up -d --build
```

Lệnh trên khởi động PostgreSQL, Spring Boot API, MinIO và Mosquitto. Kiểm tra trạng thái:

```bash
docker compose ps
```

Mosquitto không cho phép anonymous connection. Trước lần chạy đầu, hãy tạo `Server/mosquitto/passwd` với user/password tương ứng `MQTT_USERNAME` và `MQTT_PASSWORD` trong `.env`:

```bash
docker run --rm -it -v "$PWD/mosquitto:/mosquitto/config" eclipse-mosquitto:2 \
  mosquitto_passwd -c -b /mosquitto/config/passwd ems-backend '<password>'
```

### 2. Khởi động frontend

Mở terminal khác:

```bash
cd Client-ui
cp .env.example .env
docker compose up -d --build
```

Truy cập:

| Dịch vụ | URL mặc định |
| --- | --- |
| Frontend | [http://localhost:8082](http://localhost:8082) |
| Backend API | [http://localhost:8080](http://localhost:8080) |
| Swagger UI | [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html) |
| MinIO API | [http://localhost:9010](http://localhost:9010) |
| MinIO Console | [http://localhost:9011](http://localhost:9011) |
| PostgreSQL | `localhost:5435` |

Đăng ký tài khoản mới tại `/register`, sau đó đăng nhập để sử dụng các trang nghiệp vụ.

## Phát triển cục bộ

### Backend

```bash
cd Server
cp .env.example .env
docker compose --profile mqtt up -d postgres minio mosquitto

set -a
source .env
set +a
./gradlew bootRun
```

### Frontend

```bash
cd Client-ui
cp .env.example .env
npm install
npm run dev
```

Vite mặc định phục vụ tại [http://localhost:5173](http://localhost:5173). Khi frontend và backend chạy ở port khác mặc định, cập nhật `VITE_API_BASE_URL`, `VITE_WS_URL` và `CORS_ALLOWED_ORIGINS` tương ứng.

> Flyway tự chạy migration trước khi Hibernate validate schema. Không sửa migration đã được áp dụng; hãy tạo migration phiên bản mới.

## Cấu hình

### Frontend (`Client-ui/.env`)

| Biến | Mặc định | Ý nghĩa |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:8080/api` | Base URL REST API |
| `VITE_WS_URL` | `ws://localhost:8080/ws` | URL STOMP WebSocket, không bắt buộc nếu dùng mặc định |
| `VITE_APP_TITLE` | `Environment Monitoring System` | Tiêu đề ứng dụng |
| `CLIENT_PORT` | `8082` | Port host khi chạy frontend bằng Docker |

### Backend (`Server/.env`)

| Nhóm | Biến chính |
| --- | --- |
| Database | `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_PORT`, `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` |
| Security | `JWT_SECRET`, `JWT_EXPIRATION_MINUTES`, `CORS_ALLOWED_ORIGINS` |
| MQTT | `MQTT_BROKER_URL`, `MQTT_CLIENT_ID`, `MQTT_USERNAME`, `MQTT_PASSWORD`, `MQTT_TELEMETRY_TOPIC`, `MQTT_DEVICE_COMMAND_TOPIC`, `MQTT_DEVICE_STATUS_TOPIC` |
| MinIO | `MINIO_ENDPOINT`, `MINIO_PUBLIC_URL`, `MINIO_BUCKET`, `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD` |
| Retention | `TELEMETRY_RETENTION_DAYS`, `TELEMETRY_CLEANUP_BATCH_SIZE`, `TELEMETRY_CLEANUP_CRON`, `TELEMETRY_CLEANUP_ZONE` |

Không commit file `.env`, mật khẩu Mosquitto hoặc JWT secret thực tế.

## API và realtime

Tất cả API nghiệp vụ yêu cầu Bearer JWT, trừ `/api/auth/**`, health check, Swagger/OpenAPI và WebSocket handshake.

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Đăng ký tài khoản |
| `POST` | `/api/auth/login` | Đăng nhập, nhận access token |
| `GET` | `/api/telemetry/dashboard?limit=60` | Dữ liệu biểu đồ gần nhất |
| `GET` | `/api/sensors/history` | Lịch sử cảm biến: search, type, time range, sort, paging |
| `GET` | `/api/actions/history` | Lịch sử điều khiển: time search, device/action/status, sort, paging |
| `GET` | `/api/devices/status` | Trạng thái LED hiện tại từ database |
| `POST` | `/api/devices/control` | Điều khiển LED (`deviceKey`, `targetState`) |
| `GET` | `/api/devices/esp-status` | Trạng thái sống/chết ESP8266 |
| `GET` / `PUT` | `/api/profile/me` | Đọc hoặc cập nhật profile |
| `POST` | `/api/profile/me/avatar` | Upload ảnh đại diện multipart, field `file` |

Trang Swagger là nguồn chi tiết nhất về request/response schema.

Client kết nối STOMP WebSocket tới `/ws` và nhận ba topic:

| Topic | Nội dung |
| --- | --- |
| `/topic/telemetry` | Điểm telemetry mới cho biểu đồ |
| `/topic/device-status` | Trạng thái LED sau điều khiển/ACK |
| `/topic/system-status` | Trạng thái online/offline của ESP8266 |

## MQTT và phần cứng

| Topic | Chiều dữ liệu | Payload / nội dung |
| --- | --- | --- |
| `home/sensor/data` | ESP8266 → Server | `{"temp": 28.5, "humidity": 65.0, "light": 450}` |
| `home/led/control` | Server → ESP8266 | `GREEN_ON`, `GREEN_OFF`, `RED_ON`, `RED_OFF` |
| `home/led/status` | ESP8266 → Server | `{"device":"LED_GREEN","action":"TURN_ON","status":"ON"}` |

Kết nối phần cứng chuẩn:

| Thành phần | Chân NodeMCU |
| --- | --- |
| DHT11 data | D4 / GPIO 2 |
| LDR | A0 |
| LED Green | D1 / GPIO 5 |
| LED Red | D2 / GPIO 4 |

ESP8266 nên publish telemetry mỗi khoảng 3 giây. Nếu không có telemetry hoặc status trong 12 giây, backend đánh dấu thiết bị offline.

## Dữ liệu và chính sách lưu giữ

- `sensor_data` là bảng append-only dành cho dữ liệu thô. Mặc định chỉ giữ **7 ngày**.
- `TelemetryRetentionService` chạy lúc **02:15 UTC** hằng ngày, tìm bản ghi có `recorded_at` cũ hơn ngưỡng rồi xoá theo từng lô **10.000 dòng**.
- Index `(recorded_at DESC)` giúp truy vấn/xoá theo thời gian hiệu quả; index `(sensor_id, recorded_at DESC)` hỗ trợ lịch sử theo cảm biến.
- `action_history` **không** áp dụng tự dọn. Trạng thái chỉ gồm `SUCCESS` và `FAILED`.
- Khoảng thời gian gửi giữa client và API là ISO-8601 UTC; browser sẽ format lại theo giờ local khi hiển thị.

## Kiểm thử

### 1. Kiểm thử tự động Backend (Spring Boot)

Chạy toàn bộ unit tests và integration tests:

```bash
cd Server
./gradlew test
```

- Sử dụng cơ sở dữ liệu in-memory H2 với profile `test`, không phụ thuộc vào PostgreSQL hay Docker đang chạy.
- Bộ test bao gồm: kiểm thử xác thực JWT & phân quyền, API phân trang/lọc/sắp xếp của `SensorData` và `ActionHistory`, kiểm thử batch retention tự động dọn dẹp dữ liệu cũ, và tích hợp MinIO avatar storage.

### 2. Kiểm thử Frontend (React + TypeScript)

Kiểm tra cú pháp, types và đóng gói bundle:

```bash
cd Client-ui
# Kiểm tra TypeScript type safety
npx tsc --noEmit

# Build production bundle
npm run build
```

### 3. Kiểm thử luồng IoT & MQTT giả lập (Không cần phần cứng thật)

Nếu chưa có vi điều khiển ESP8266 thật, bạn có thể dùng công cụ dòng lệnh Mosquitto để giả lập phần cứng:

- **Giả lập ESP8266 gửi dữ liệu cảm biến (Telemetry Uplink):**
  ```bash
  mosquitto_pub -h localhost -p 1883 -u ems-backend -P '<password>' \
    -t "home/sensor/data" \
    -m '{"temp": 28.5, "humidity": 65.0, "light": 450}'
  ```
  *Kết quả:* Biểu đồ trên Web Dashboard tự động nhảy điểm mới và nhịp tim ESP8266 chuyển sang **Online**.

- **Lắng nghe lệnh điều khiển từ Web (Device Command Downlink):**
  ```bash
  mosquitto_sub -h localhost -p 1883 -u ems-backend -P '<password>' \
    -t "home/led/control"
  ```
  *Kết quả:* Khi bạn gạt công tắc trên Web Control Panel, terminal sẽ in ra lệnh tương ứng: `GREEN_ON`, `GREEN_OFF`, `RED_ON`, hoặc `RED_OFF`.

- **Giả lập ESP8266 gửi phản hồi xác nhận (Device Status ACK):**
  ```bash
  mosquitto_pub -h localhost -p 1883 -u ems-backend -P '<password>' \
    -t "home/led/status" \
    -m '{"device":"LED_GREEN","action":"TURN_ON","status":"ON"}'
  ```
  *Kết quả:* Nút gạt trên Web chuyển từ trạng thái quay chờ (`loading`) sang màu xanh ON chính thức, đồng thời bản ghi trong `action_history` được cập nhật sang `SUCCESS`.

## Liên kết dự án

- [Figma design](https://www.figma.com/design/fJX4Oy0EqBTVABP1AIUHQQ/Iot?node-id=0-1&p=f&t=Depdw7JAei5kmUqf-0)
- [GitHub repository](https://github.com/CTranLam/ENVIRONMENT-MONITORING-SYSTEM)
- [Báo cáo bài tập lớn IoT](https://ptiteduvn-my.sharepoint.com/:w:/r/personal/lamtq_b23cn480_stu_ptit_edu_vn/_layouts/15/Doc.aspx?sourcedoc=%7B32F9E2F7-EAA1-4DF1-B6A2-FD787A47B208%7D&file=BTL-IOT.docx&action=default&mobileredirect=true&wdOrigin=APPHOME-WEB.DIRECT%2CAPPHOME-WEB.FILEBROWSER.RECENT&wdPreviousSession=81ba4a6e-94b3-4671-b6e6-18b3473c4c18&wdPreviousSessionSrc=AppHomeWeb)
