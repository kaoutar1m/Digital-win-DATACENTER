import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { connectDatabase } from './database/connection';

// Routes
import zoneRoutes from './routes/zoneRoutes';
import rackRoutes from './routes/rackRoutes';
import equipmentRoutes from './routes/equipmentRoutes';
import equipmentModelRoutes from './routes/equipmentModelRoutes';
import cameraRoutes from './routes/cameraRoutes';
import userRoutes from './routes/userRoutes';
import alertRoutes from './routes/alertRoutes';
import metricRoutes from './routes/metricRoutes';
import accessLogRoutes from './routes/accessLogRoutes';

// Services
import { initializeSocketService } from './services/socketService';

const app = express();
const server = createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/zones', zoneRoutes);
app.use('/api/racks', rackRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/equipment', equipmentModelRoutes);
app.use('/api/cameras', cameraRoutes);
app.use('/api/users', userRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/metrics', metricRoutes);
app.use('/api/access-logs', accessLogRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize services and start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Initialize WebSocket service
    initializeSocketService(io);

    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`🚀 DC-MASTER Backend Server running on port ${PORT}`);
      console.log(`📊 Health check available at http://localhost:${PORT}/health`);
      console.log(`🌐 WebSocket server initialized`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

startServer();

export default app;
