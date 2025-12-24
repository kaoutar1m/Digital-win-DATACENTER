"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const index_1 = require("../index");
class SocketService {
    static emitSensorUpdate(sensor) {
        index_1.io.emit('sensor-update', sensor);
    }
    static emitAlert(alert) {
        index_1.io.emit('alert', alert);
    }
    static emitAccessLog(log) {
        index_1.io.emit('access-log', log);
    }
}
exports.SocketService = SocketService;
//# sourceMappingURL=socketService.js.map