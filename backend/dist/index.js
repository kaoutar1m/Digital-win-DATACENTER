"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const zoneRoutes_1 = __importDefault(require("./routes/zoneRoutes"));
const rackRoutes_1 = __importDefault(require("./routes/rackRoutes"));
const sensorRoutes_1 = __importDefault(require("./routes/sensorRoutes"));
const alertRoutes_1 = __importDefault(require("./routes/alertRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
exports.io = io;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api', zoneRoutes_1.default);
app.use('/api', rackRoutes_1.default);
app.use('/api', sensorRoutes_1.default);
app.use('/api', alertRoutes_1.default);
app.get('/', (req, res) => {
    res.json({ message: 'Data Center 3D Platform API' });
});
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map