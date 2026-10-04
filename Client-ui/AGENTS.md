# Frontend Development Rules & Guidelines (React 18 + TypeScript)

Tài liệu này chứa toàn bộ các quy tắc bắt buộc (Rules & Coding Standards) cho hệ thống Frontend của **Environment Monitoring System (EMS)**. Mọi Agent / AI khi sinh mã (generate code) hoặc tái cấu trúc (refactor) trong thư mục `Client/` **BẮT BUỘC** phải tuân thủ nghiêm ngặt các quy chuẩn dưới đây.

---

## 1. Kiến Trúc Thư Mục: Feature-Based Architecture (FBA)

Toàn bộ mã nguồn theo nghiệp vụ phải được đặt trong `src/features/<feature-name>/`. Tuyệt đối không để logic, components hay types nằm phân tán ngoài thư mục feature.

Mỗi feature bắt buộc tuân theo cấu trúc chuẩn:
```
src/features/<feature-name>/
├── components/       # UI Components thuần túy (Presenter) - chỉ render giao diện, nhận props/hook
├── hooks/            # Custom Hooks (Container) - chứa toàn bộ logic, side effects, gọi Redux
├── services/         # API Service (Axios / Fetch) - định nghĩa các hàm gọi HTTP xuống Backend
├── slices/           # Redux Toolkit Slice - quản lý state tập trung, async thunks, reducers
├── types/            # TypeScript Interfaces & Types - đồng bộ 100% với Database & API contracts
└── index.ts          # Public API của feature - CHỈ export những gì các module khác được phép dùng
```

### Quy tắc Import giữa các Feature:
- **Nguyên tắc "Đóng gói"**: Module bên ngoài khi cần dùng tài nguyên của `<feature>` CHỈ ĐƯỢC PHÉP import qua `index.ts` của feature đó.
  - ✅ **Đúng**: `import { useProfile, UserProfile } from '@/features/profile';`
  - ❌ **Sai**: `import { ProfileInfoCard } from '@/features/profile/components/ProfileInfoCard';`
- Sử dụng Path Alias `@/` (trỏ đến `src/`) thay vì dùng relative path dài (`../../`).

---

## 2. Quản Lý State (State Management)

### Quy tắc sử dụng Redux Toolkit:
1. **Không lạm dụng `useState` thủ công**:
   - Nghiệp vụ dữ liệu lớn, danh sách, dữ liệu thời gian thực (realtime telemetry), trạng thái thiết bị hoặc dữ liệu dùng chung giữa các trang **bắt buộc** phải lưu trong Redux Toolkit Slice (`src/features/<feature>/slices/`).
   - `useState` cục bộ **chỉ được dùng** cho các trạng thái giao diện tạm thời (ephemeral UI state) như: đóng/mở modal, toggle dropdown, tooltip.
2. **Luôn sử dụng Typed Hooks của dự án**:
   - Sử dụng `useAppSelector` và `useAppDispatch` từ `@/app/hooks`. Không import trực tiếp `useSelector`, `useDispatch` từ `react-redux`.
3. **Xử lý Bất đồng bộ (Async Thunk)**:
   - Các thao tác gọi API Backend (như điều khiển bật/tắt thiết bị, fetch dữ liệu profile, truy vấn lịch sử) phải dùng `createAsyncThunk`.
   - Hỗ trợ Optimistic Update (cập nhật giao diện ngay lập tức trong `pending` và rollback nếu `rejected`).

### Quy tắc Tách rời UI & Logic (Presenter & Container Pattern):
- Component trong `components/` **không được chứa** các khối `useEffect` phức tạp hay hàng loạt logic tính toán dữ liệu.
- Mọi logic tính toán, interval stream, WebSocket listeners và Redux dispatch phải được đóng gói gọn gàng trong Custom Hook tại `hooks/use<Feature>.ts`.

---

## 3. Quy Chuẩn Tạo Kiểu (Styling System): Tailwind CSS + Ant Design v5

1. **Tailwind CSS là công cụ tạo kiểu chính**:
   - Sử dụng toàn bộ utility classes của Tailwind (`flex`, `grid`, `rounded-[24px]`, `px-7`, `gap-4`, v.v.).
   - Tránh viết CSS thuần hoặc inline styles (`style={{ ... }}`), trừ trường hợp các giá trị động bắt buộc tính theo toán học (như tọa độ SVG, stroke-dasharray).
2. **Tương thích Ant Design v5 (`preflight: false`)**:
   - Dự án tắt `preflight` trong `tailwind.config.js` để bảo vệ kiểu dáng chuẩn của Ant Design.
   - **Quy tắc viền (Border Rule)**: Khi tạo viền bằng Tailwind, phải luôn đảm bảo có kiểu viền solid, ví dụ: `border border-solid border-slate-200` hoặc `border-[1.5px] border-solid border-[#e2e8f0]`.
3. **Màu sắc & Nhận diện thương hiệu**:
   - Màu chủ đạo toàn hệ thống: **`#0099FF`** (Primary Blue).
   - Nền trang web: màu trắng tự nhiên **`#ffffff`**.
   - Thẻ hiển thị thông số: bo góc lớn mềm mại (`rounded-[24px]`), viền mảnh `border-[#e2e8f0]`, bóng đổ nhẹ `shadow-[0_4px_20px_rgba(0,0,0,0.03)]`.
4. **Quy chuẩn Khung Layout Chung (`MainLayout.tsx`)**:
   - **Header**: Màu `#0099FF`, chiều cao `min-h-[70px]`, padding `px-7`. Bên trái là cụm điều hướng bo tròn nền trắng (`.nav-cluster-container`), bên phải là User Avatar pill linking sang `/profile`.
   - **Main**: Padding `px-7 py-6`, `bg-white`, co giãn linh hoạt toàn màn hình, không có viền bao quanh toàn trang.
   - **Footer**: Màu `#0099FF`, padding `px-8 py-3.5`, chia 3 cụm thông tin cân đối: Bản quyền bên trái, Tên tác giả ở giữa, Trạng thái `System: Online` kèm chấm xanh nhấp nháy (`.status-dot-pulse`) ở bên phải.
   - **Dashboard Layout**: Cột trái (3 biểu đồ) và Cột phải (Control Panel) phải luôn dùng Flexbox căn đều (`Row align="stretch"` và `flex: 1`), đảm bảo **đỉnh trên và chân đáy của 2 cột bằng phẳng tuyệt đối**.

---

## 4. Quy Chuẩn TypeScript & Code Quality

1. **Nghiêm cấm dùng kiểu `any`**:
   - Mọi biến, props, state, tham số hàm và response API đều phải được định kiểu rõ ràng (`interface` hoặc `type`).
2. **Đồng bộ Schema Type**:
   - Mọi type định nghĩa trong `types/` phải phản ánh chính xác cấu trúc cơ sở dữ liệu (ví dụ `UserProfile` có đầy đủ `username`, `email`, `studentId`, `avatarUrl`, 4 link dự án).
3. **Đặt tên chuẩn (Naming Conventions)**:
   - Component: PascalCase (ví dụ `SensorChartCard.tsx`, `DashboardPage.tsx`).
   - Hook: camelCase bắt đầu bằng `use` (ví dụ `useDashboard.ts`, `useProfile.ts`).
   - Slice: camelCase kết thúc bằng `Slice` (ví dụ `dashboardSlice.ts`).
   - Service / API: camelCase kết thúc bằng `Api` (ví dụ `dashboardApi.ts`).
   - Type file: kebab-case kết thúc bằng `.types.ts` (ví dụ `dashboard.types.ts`).

---

## 5. Kiến Trúc Luồng Dữ Liệu IoT & Realtime

Mọi tương tác giữa Frontend và phần cứng phải tuân theo luồng chuẩn:
1. **Điều khiển thiết bị (Downlink)**:
   - FE (bật/tắt Switch) $\to$ Dispatch Redux Thunk $\to$ Gọi Backend API (`dashboardApi.controlDevice`) $\to$ Backend publish MQTT topic (`esp8266/control/...`) $\to$ ESP8266 kích hoạt Relay.
2. **Đồng bộ trạng thái phần cứng (Uplink / Ack)**:
   - ESP8266 gửi trạng thái thực tế lên MQTT $\to$ Backend bắn WebSocket $\to$ FE lắng nghe và dispatch `setDeviceStateDirect` vào Redux để cập nhật switch chính xác.
3. **Dữ liệu cảm biến thời gian thực (Telemetry)**:
   - ESP8266 đọc cảm biến DHT22/LDR $\to$ MQTT $\to$ Backend lưu DB $\to$ WebSocket event (`sensor:data`) $\to$ FE dispatch `addSensorTelemetryPoint` vào Redux $\to$ 3 biểu đồ tự động trượt mảng mượt mà.

