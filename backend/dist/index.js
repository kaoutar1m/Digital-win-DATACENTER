import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import rackRoutes from './routes/rackRoutes.js';
import zoneRoutes from './routes/zoneRoutes.js';
import sensorRoutes from './routes/sensorRoutes.js';
import alertRoutes from './routes/alertRoutes.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/racks', rackRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/alerts', alertRoutes);

// Interface for alerts
interface Alert {
  id: string;
  level: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  rack_id?: string;
}

let alerts: Alert[] = [
  {
    id: '1',
    level: 'warning',
    message: 'Temperature élevée détectée dans le rack A1',
    timestamp: new Date().toISOString(),
    acknowledged: false,
    rack_id: 'rack-1'
  },
  {
    id: '2',
    level: 'info',
    message: 'Maintenance programmée pour demain',
    timestamp: new Date().toISOString(),
    acknowledged: false
  }
];

// WebSocket handling
io.on('connection', (socket) => {
  console.log('Client connecté:', socket.id);

  socket.on('stats:request', () => {
    const stats = {
      totalRacks: 42,
      activeServers: 168,
      powerConsumption: 125.5,
      temperature: 22.3,
      efficiency: 0.92
    };
    socket.emit('stats:update', stats);
  });

  socket.on('alert:request', () => {
    const alertsData = [
      { 
        id: 1, 
        type: 'temperature', 
        message: 'Température élevée dans la zone A', 
        level: 'warning', 
        timestamp: new Date().toISOString() 
      },
      { 
        id: 2, 
        type: 'power', 
        message: 'Surcharge détectée sur le rack 12', 
        level: 'critical', 
        timestamp: new Date().toISOString() 
      }
    ];
    socket.emit('alert:initial', alertsData);
  });

  socket.on('disconnect', () => {
    console.log('Client déconnecté:', socket.id);
  });
});

// Real-time updates
setInterval(() => {
  const stats = {
    totalRacks: 42,
    activeServers: 168,
    powerConsumption: Math.floor(Math.random() * 50) + 100,
    temperature: Math.floor(Math.random() * 5) + 20,
    efficiency: 0.92
  };
  io.emit('stats:update', stats);

  if (Math.random() > 0.7) {
    const levels: Array<'info' | 'warning' | 'critical'> = ['info', 'warning', 'critical'];
    const newAlert: Alert = {
      id: Date.now().toString(),
      level: levels[Math.floor(Math.random() * 3)],
      message: Math.random() > 0.5
        ? 'Température élevée détectée dans le système de refroidissement'
        : 'Consommation électrique anormale détectée',
      timestamp: new Date().toISOString(),
      acknowledged: false,
      rack_id: `rack-${Math.floor(Math.random() * 5) + 1}`
    };
    alerts.push(newAlert);
    io.emit('alert:new', newAlert);
  }
}, 30000);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});