import { io } from '../index';

export class SocketService {
  static emitSensorUpdate(sensor: any) {
    io.emit('sensor-update', sensor);
  }

  static emitAlert(alert: any) {
    io.emit('alert', alert);
  }

  static emitAccessLog(log: any) {
    io.emit('access-log', log);
  }
}
