import { Camera, Detection } from '../models/Camera';

export class CameraService {
  private cameras: Camera[] = [];
  private detections: Detection[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize with mock camera data
    this.cameras = [
      {
        id: 'cam-001',
        zone_id: 'zone-001',
        name: 'Main Entrance Camera',
        type: 'fixed',
        status: 'online',
        position_3d: { x: 10, y: 5, z: 0 },
        fov: 90,
        resolution: '1920x1080',
        recording_enabled: true,
        motion_detection: true,
        ai_enabled: true,
        detections: [],
        last_motion: new Date(),
        last_recording: new Date(),
        ip_address: '192.168.1.100',
        mac_address: '00:1B:44:11:3A:B1',
        firmware_version: '1.2.3',
        created_at: new Date('2024-01-01'),
        updated_at: new Date()
      },
      {
        id: 'cam-002',
        zone_id: 'zone-001',
        name: 'Server Room PTZ',
        type: 'ptz',
        status: 'online',
        position_3d: { x: 5, y: 3, z: 2 },
        rotation: { x: 0, y: 45, z: 0 },
        fov: 60,
        resolution: '4K',
        recording_enabled: true,
        motion_detection: true,
        ai_enabled: true,
        detections: [],
        last_motion: new Date(),
        last_recording: new Date(),
        ip_address: '192.168.1.101',
        mac_address: '00:1B:44:11:3A:B2',
        firmware_version: '2.1.0',
        created_at: new Date('2024-01-01'),
        updated_at: new Date()
      }
    ];
  }

  async getAllCameras(filters: any = {}): Promise<Camera[]> {
    let filteredCameras = [...this.cameras];

    if (filters.zone_id) {
      filteredCameras = filteredCameras.filter(cam => cam.zone_id === filters.zone_id);
    }

    if (filters.status) {
      filteredCameras = filteredCameras.filter(cam => cam.status === filters.status);
    }

    if (filters.type) {
      filteredCameras = filteredCameras.filter(cam => cam.type === filters.type);
    }

    return filteredCameras;
  }

  async getCameraById(id: string): Promise<Camera | null> {
    return this.cameras.find(cam => cam.id === id) || null;
  }

  async createCamera(cameraData: Partial<Camera>): Promise<Camera> {
    const newCamera: Camera = {
      id: `cam-${Date.now()}`,
      zone_id: cameraData.zone_id!,
      name: cameraData.name!,
      type: cameraData.type || 'fixed',
      status: cameraData.status || 'offline',
      position_3d: cameraData.position_3d || { x: 0, y: 0, z: 0 },
      fov: cameraData.fov || 90,
      resolution: cameraData.resolution || '1920x1080',
      recording_enabled: cameraData.recording_enabled || false,
      motion_detection: cameraData.motion_detection || false,
      ai_enabled: cameraData.ai_enabled || false,
      detections: [],
      ip_address: cameraData.ip_address,
      mac_address: cameraData.mac_address,
      firmware_version: cameraData.firmware_version,
      created_at: new Date(),
      updated_at: new Date(),
      ...cameraData
    };

    this.cameras.push(newCamera);
    return newCamera;
  }

  async updateCamera(id: string, updates: Partial<Camera>): Promise<Camera | null> {
    const index = this.cameras.findIndex(cam => cam.id === id);
    if (index === -1) return null;

    this.cameras[index] = {
      ...this.cameras[index],
      ...updates,
      updated_at: new Date()
    };

    return this.cameras[index];
  }

  async deleteCamera(id: string): Promise<boolean> {
    const index = this.cameras.findIndex(cam => cam.id === id);
    if (index === -1) return false;

    this.cameras.splice(index, 1);
    return true;
  }

  async getCameraDetections(
    cameraId: string,
    type?: string,
    startDate?: string,
    endDate?: string
  ): Promise<Detection[]> {
    let filteredDetections = this.detections.filter(det => det.camera_id === cameraId);

    if (type) {
      filteredDetections = filteredDetections.filter(det => det.type === type);
    }

    if (startDate) {
      const start = new Date(startDate);
      filteredDetections = filteredDetections.filter(det => det.timestamp >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      filteredDetections = filteredDetections.filter(det => det.timestamp <= end);
    }

    return filteredDetections;
  }

  async controlPTZ(cameraId: string, controls: { action: string; pan?: number; tilt?: number; zoom?: number }): Promise<any> {
    const camera = this.cameras.find(cam => cam.id === cameraId);
    if (!camera || camera.type !== 'ptz') {
      throw new Error('Camera not found or not a PTZ camera');
    }

    // Simulate PTZ control
    if (controls.pan !== undefined) {
      camera.rotation = { ...camera.rotation, y: controls.pan };
    }
    if (controls.tilt !== undefined) {
      camera.rotation = { ...camera.rotation, x: controls.tilt };
    }

    camera.updated_at = new Date();

    return {
      success: true,
      message: `PTZ control applied: ${controls.action}`,
      camera_id: cameraId,
      timestamp: new Date()
    };
  }

  async controlRecording(cameraId: string, action: 'start' | 'stop'): Promise<any> {
    const camera = this.cameras.find(cam => cam.id === cameraId);
    if (!camera) {
      throw new Error('Camera not found');
    }

    camera.recording_enabled = action === 'start';
    camera.last_recording = new Date();
    camera.updated_at = new Date();

    return {
      success: true,
      message: `Recording ${action}ed`,
      camera_id: cameraId,
      recording_enabled: camera.recording_enabled,
      timestamp: new Date()
    };
  }

  // Simulate real-time detection
  async addDetection(cameraId: string, detection: Omit<Detection, 'id' | 'camera_id' | 'timestamp'>): Promise<Detection> {
    const newDetection: Detection = {
      id: `det-${Date.now()}-${Math.random()}`,
      camera_id: cameraId,
      type: detection.type,
      confidence: detection.confidence,
      bounding_box: detection.bounding_box,
      timestamp: new Date(),
      snapshot_url: detection.snapshot_url,
      metadata: detection.metadata
    };

    this.detections.push(newDetection);

    // Update camera's last motion
    const camera = this.cameras.find(cam => cam.id === cameraId);
    if (camera) {
      camera.last_motion = new Date();
      camera.updated_at = new Date();
    }

    return newDetection;
  }
}
