import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3002",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(express.json());

// Routes
// ... vos routes Express ...

// Socket.io
io.on('connection', (socket) => {
  console.log('Client connecté:', socket.id);

  // Envoyer les statistiques initiales
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

  // Envoyer les alertes initiales
  socket.on('alert:request', () => {
    const alerts = [
      { id: 1, type: 'temperature', message: 'Température élevée dans la zone A', severity: 'warning' },
      { id: 2, type: 'power', message: 'Surcharge détectée sur le rack 12', severity: 'critical' }
    ];
    socket.emit('alert:initial', alerts);
  });

  socket.on('disconnect', () => {
    console.log('Client déconnecté:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});