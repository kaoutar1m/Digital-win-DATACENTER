# Data Center 3D Platform

A full-stack 3D data center monitoring platform built with Node.js, Express, PostgreSQL, React, Three.js, and Socket.io.

## Features

- **3D Visualization**: Interactive 3D data center model with building, racks, and security zones
- **Real-time Monitoring**: Live sensor data updates via WebSocket
- **Zone Management**: Security zones with different access levels
- **Rack Monitoring**: Server rack status, temperature, and power usage
- **Alert System**: Real-time alerts for sensor thresholds
- **Access Logging**: Security access logs and monitoring

## Tech Stack

### Backend
- Node.js + TypeScript
- Express.js
- PostgreSQL
- Socket.io
- Joi validation

### Frontend
- React + TypeScript
- Three.js + React Three Fiber
- Zustand state management
- Tailwind CSS
- Socket.io client

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Docker (optional)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd data-center-3d-platform
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your database credentials
```

5. Start PostgreSQL (using Docker)
```bash
docker-compose up -d postgres
```

6. Run database migrations
```bash
cd backend
npm run db:init
```

7. Start the backend
```bash
npm run dev
```

8. Start the frontend (in another terminal)
```bash
cd frontend
npm run dev
```

## API Endpoints

- `GET /api/zones` - Get all zones
- `POST /api/zones` - Create a new zone
- `GET /api/racks` - Get all racks
- `POST /api/racks` - Create a new rack
- `GET /api/sensors` - Get all sensors
- `POST /api/alerts` - Create an alert

## WebSocket Events

- `sensor-update` - Real-time sensor data
- `alert` - New alerts
- `access-log` - Access logs

## Project Structure

```
data-center-3d-platform/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/
│   │   └── models/
│   ├── src/
│   │   ├── components/
│   │   ├── stores/
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── database/
│   └── init.sql
├── docker-compose.yml
└── README.md
```

## Development

### Backend Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License
