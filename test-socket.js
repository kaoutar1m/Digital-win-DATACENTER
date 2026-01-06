const io = require('socket.io-client');

const socket = io('http://localhost:3001', {
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('Connected to backend socket');

  // Request stats
  socket.emit('stats:request');
  console.log('Requested stats');

  // Request alerts
  socket.emit('alert:request');
  console.log('Requested alerts');
});

socket.on('stats:update', (stats) => {
  console.log('Received stats:', stats);
});

socket.on('alert:initial', (alerts) => {
  console.log('Received alerts:', alerts);
});

socket.on('disconnect', () => {
  console.log('Disconnected from backend socket');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

// Wait for periodic updates
setTimeout(() => {
  console.log('Waiting for periodic updates...');
}, 10000);

// Close after 35 seconds
setTimeout(() => {
  console.log('Closing test connection');
  socket.disconnect();
  process.exit(0);
}, 35000);
