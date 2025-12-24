"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
var express_1 = require("express");
var cors_1 = require("cors");
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var dotenv_1 = require("dotenv");
var zoneRoutes_1 = require("./routes/zoneRoutes");
var rackRoutes_1 = require("./routes/rackRoutes");
var sensorRoutes_1 = require("./routes/sensorRoutes");
var alertRoutes_1 = require("./routes/alertRoutes");
dotenv_1.default.config();
var app = (0, express_1.default)();
var server = (0, http_1.createServer)(app);
var io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
exports.io = io;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api', zoneRoutes_1.default);
app.use('/api', rackRoutes_1.default);
app.use('/api', sensorRoutes_1.default);
app.use('/api', alertRoutes_1.default);
app.get('/', function (req, res) {
    res.json({ message: 'Data Center 3D Platform API' });
});
// Socket.io connection
io.on('connection', function (socket) {
    console.log('Client connected:', socket.id);
    socket.on('disconnect', function () {
        console.log('Client disconnected:', socket.id);
    });
});
var PORT = process.env.PORT || 3001;
server.listen(PORT, function () {
    console.log("Server running on port ".concat(PORT));
});
