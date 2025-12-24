"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
var index_1 = require("../index");
var SocketService = /** @class */ (function () {
    function SocketService() {
    }
    SocketService.emitSensorUpdate = function (sensor) {
        index_1.io.emit('sensor-update', sensor);
    };
    SocketService.emitAlert = function (alert) {
        index_1.io.emit('alert', alert);
    };
    SocketService.emitAccessLog = function (log) {
        index_1.io.emit('access-log', log);
    };
    return SocketService;
}());
exports.SocketService = SocketService;
