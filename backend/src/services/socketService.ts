import { Server, Socket } from 'socket.io';
import { AlertService } from './alertService';
import { MetricService } from './metricService';

// Keep track of the io instance
let ioInstance: Server;

export const initializeSocket = (io: Server) => {
  ioInstance = io;

  io.on('connection', (socket: Socket) => {
    console.log('Client connecté via Socket.io:', socket.id);

    // Handle initial requests from client
    handleInitialData(socket);

    socket.on('disconnect', () => {
      console.log('Client déconnecté:', socket.id);
    });
  });

  // Start periodic data emission
  startMonitoring();
};

const handleInitialData = async (socket: Socket) => {
  // Client requests initial alerts
  socket.on('alert:request', async () => {
    try {
      const alerts = await AlertService.getRecentAlerts(20);
      socket.emit('alert:initial', alerts);
    } catch (error) {
      console.error('Error fetching initial alerts:', error);
      socket.emit('error', 'Failed to fetch initial alerts');
    }
  });

  // Client requests initial stats
  socket.on('stats:request', async () => {
    try {
      const stats = await MetricService.getGlobalStats();
      socket.emit('stats:update', stats);
    } catch (error) {
      console.error('Error fetching initial stats:', error);
      socket.emit('error', 'Failed to fetch initial stats');
    }
  });
};

const startMonitoring = () => {
  // Emit stats periodically
  setInterval(async () => {
    try {
      const stats = await MetricService.getGlobalStats();
      ioInstance.emit('stats:update', stats);
    } catch (error) {
      console.error('Error fetching periodic stats:', error);
    }
  }, 30000); // Every 30 seconds

  // Here you could add logic to check for new alerts periodically if needed,
  // but a better approach is to emit alerts when they are created (event-driven).
};

// Export a function to emit events from other services
export const emitSocketEvent = (eventName: string, data: any) => {
  if (ioInstance) {
    ioInstance.emit(eventName, data);
  }
};