# Environment Monitoring System

Web application for monitoring environmental telemetry and controlling connected devices. The current interface is designed for two devices: a cooling fan and a light.

## Features

- Dashboard for temperature, humidity, and light-intensity telemetry.
- Cooling Fan and Light controls.
- Sensor Data history with keyword search, sensor type, time range, sorting, page-size selection, and row numbering.
- Action History with device, action, status, time-range filters, sorting, page-size selection, and row numbering.
- Alert notifications for environmental thresholds and device-control events.
- Profile page with project report, Figma, and GitHub links.

## Tech Stack

- React 18 and TypeScript
- Vite
- Redux Toolkit
- React Router
- Ant Design and Tailwind CSS
- Axios

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm

### Run locally

```bash
cd Client
npm install
cp .env.example .env
npm run dev
```

Open the URL shown by Vite, normally [http://localhost:5173](http://localhost:5173).

### Build for production

```bash
cd Client
npm run build
```

## Environment Variables

Create `Client/.env` from `Client/.env.example`.

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Base URL for the backend API | `http://localhost:8080/api` |
| `VITE_APP_TITLE` | Application title | `Environment Monitoring System` |

When the backend endpoints are unavailable, Sensor Data, Action History, Dashboard controls, and Profile use local mock/fallback data so the interface remains usable during frontend development.

## Application Routes

| Route | Description |
| --- | --- |
| `/dashboard` | Environmental dashboard and device controls |
| `/sensor-data` | Sensor telemetry history |
| `/action-history` | Device action history |
| `/profile` | User profile and project resources |

## Project Structure

```text
Client/
  src/
    app/                 Redux store and typed hooks
    features/            Feature-based application modules
      action-history/    Device control history
      alerts/            Alert management
      dashboard/         Charts and device controls
      monitoring/        Sensor data history
      profile/           User profile and project links
    layouts/             Shared application layout
    routes/              Route definitions
    services/            Shared API client
```

## Project Links

- [Figma design](https://www.figma.com/design/fJX4Oy0EqBTVABP1AIUHQQ/Iot?node-id=0-1&p=f&t=Depdw7JAei5kmUqf-0)
- [GitHub repository](https://github.com/CTranLam/ENVIRONMENT-MONITORING-SYSTEM)
- [IoT project report](https://ptiteduvn-my.sharepoint.com/:w:/r/personal/lamtq_b23cn480_stu_ptit_edu_vn/_layouts/15/Doc.aspx?sourcedoc=%7B32F9E2F7-EAA1-4DF1-B6A2-FD787A47B208%7D&file=BTL-IOT.docx&action=default&mobileredirect=true&wdOrigin=APPHOME-WEB.DIRECT%2CAPPHOME-WEB.FILEBROWSER.RECENT&wdPreviousSession=81ba4a6e-94b3-4671-b6e6-18b3473c4c18&wdPreviousSessionSrc=AppHomeWeb&ct=1790149942054)

## Author

Tran Quang Lam - B23DCCN480
