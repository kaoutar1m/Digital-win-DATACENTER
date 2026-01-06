import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<any>) => {
    const { response, request, message } = error;

    if (response) {
      // Server responded with error status
      const { status, data } = response;

      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden
          showToast('error', 'Access denied', 'You do not have permission to perform this action');
          break;
        case 404:
          showToast('error', 'Not found', 'The requested resource was not found');
          break;
        case 422:
          // Validation errors
          if (data && typeof data === 'object' && 'errors' in data) {
            const errors = data.errors as Record<string, string[]>;
            Object.values(errors).forEach(errorArray => {
              errorArray.forEach(error => showToast('error', 'Validation Error', error));
            });
          }
          break;
        case 500:
          showToast('error', 'Server Error', 'An internal server error occurred');
          break;
        default:
          showToast('error', 'Error', data?.message || 'An unexpected error occurred');
      }
    } else if (request) {
      // Network error
      showToast('error', 'Network Error', 'Unable to connect to the server. Please check your internet connection.');
    } else {
      // Something else
      showToast('error', 'Error', message || 'An unexpected error occurred');
    }

    return Promise.reject(error);
  }
);

// Toast notification helper
const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
  // This will be replaced with actual toast implementation
  console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
};

// API methods with retry logic
export const apiRequest = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  data?: any,
  config?: Record<string, any>,
  retryCount = 0
): Promise<T> => {
  try {
    const response = await api.request<T>({
      method,
      url,
      data,
      ...config,
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;

    // Retry logic for network errors
    if (retryCount < 3 && (!axiosError.response || (axiosError.response.status >= 500))) {
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      return apiRequest(method, url, data, config, retryCount + 1);
    }

    throw error;
  }
};

// Type definitions
export interface Camera {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'recording';
  zoneId: string;
  resolution: string;
  fps: number;
  ipAddress: string;
  port: number;
  username?: string;
  password?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CameraFeed {
  id: string;
  cameraId: string;
  streamUrl: string;
  status: 'active' | 'inactive';
  quality: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface CameraEvent {
  id: string;
  cameraId: string;
  type: 'motion' | 'person' | 'vehicle' | 'tamper' | 'connection_lost' | 'connection_restored';
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Zone {
  id: string;
  name: string;
  description?: string;
  type: 'security' | 'temperature' | 'power' | 'network';
  boundaries?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  modelId: string;
  zoneId: string;
  rackId?: string;
  position?: any;
  status: 'active' | 'inactive' | 'maintenance' | 'failed';
  specifications?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  zoneId?: string;
  equipmentId?: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccessLog {
  id: string;
  userId?: string;
  username?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
  createdAt: string;
}

export interface Metric {
  id: string;
  type: string;
  value: number;
  unit: string;
  equipmentId?: string;
  zoneId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Specific API methods
export const apiService = {
  // Generic CRUD operations
  get: <T>(url: string, config?: Record<string, any>) => 
    apiRequest<T>('GET', url, undefined, config),
  
  post: <T>(url: string, data?: any, config?: Record<string, any>) => 
    apiRequest<T>('POST', url, data, config),
  
  put: <T>(url: string, data?: any, config?: Record<string, any>) => 
    apiRequest<T>('PUT', url, data, config),
  
  patch: <T>(url: string, data?: any, config?: Record<string, any>) => 
    apiRequest<T>('PATCH', url, data, config),
  
  delete: <T>(url: string, config?: Record<string, any>) => 
    apiRequest<T>('DELETE', url, undefined, config),

  // Camera operations
  cameras: {
    getAll: () => apiRequest<Camera[]>('GET', '/cameras'),
    getById: (id: string) => apiRequest<Camera>('GET', `/cameras/${id}`),
    create: (data: Partial<Camera>) => apiRequest<Camera>('POST', '/cameras', data),
    update: (id: string, data: Partial<Camera>) => apiRequest<Camera>('PUT', `/cameras/${id}`, data),
    delete: (id: string) => apiRequest<void>('DELETE', `/cameras/${id}`),
  },

  // Camera feed operations
  cameraFeeds: {
    getAll: () => apiRequest<CameraFeed[]>('GET', '/camera-feeds'),
    getById: (id: string) => apiRequest<CameraFeed>('GET', `/camera-feeds/${id}`),
    create: (data: Partial<CameraFeed>) => apiRequest<CameraFeed>('POST', '/camera-feeds', data),
    update: (id: string, data: Partial<CameraFeed>) => apiRequest<CameraFeed>('PUT', `/camera-feeds/${id}`, data),
    delete: (id: string) => apiRequest<void>('DELETE', `/camera-feeds/${id}`),
  },

  // Camera event operations
  cameraEvents: {
    getAll: (params?: { cameraId?: string; type?: string; limit?: number }) =>
      apiRequest<CameraEvent[]>('GET', '/camera-events', undefined, { params }),
    getById: (id: string) => apiRequest<CameraEvent>('GET', `/camera-events/${id}`),
    create: (data: Partial<CameraEvent>) => apiRequest<CameraEvent>('POST', '/camera-events', data),
    update: (id: string, data: Partial<CameraEvent>) => apiRequest<CameraEvent>('PUT', `/camera-events/${id}`, data),
    delete: (id: string) => apiRequest<void>('DELETE', `/camera-events/${id}`),
  },

  // User operations
  users: {
    getAll: () => apiRequest<User[]>('GET', '/users'),
    getById: (id: string) => apiRequest<User>('GET', `/users/${id}`),
    create: (data: Partial<User>) => apiRequest<User>('POST', '/users', data),
    update: (id: string, data: Partial<User>) => apiRequest<User>('PUT', `/users/${id}`, data),
    delete: (id: string) => apiRequest<void>('DELETE', `/users/${id}`),
  },

  // Zone operations
  zones: {
    getAll: () => apiRequest<Zone[]>('GET', '/zones'),
    getById: (id: string) => apiRequest<Zone>('GET', `/zones/${id}`),
    create: (data: Partial<Zone>) => apiRequest<Zone>('POST', '/zones', data),
    update: (id: string, data: Partial<Zone>) => apiRequest<Zone>('PUT', `/zones/${id}`, data),
    delete: (id: string) => apiRequest<void>('DELETE', `/zones/${id}`),
  },

  // Equipment operations
  equipment: {
    getAll: () => apiRequest<Equipment[]>('GET', '/equipment'),
    getById: (id: string) => apiRequest<Equipment>('GET', `/equipment/${id}`),
    create: (data: Partial<Equipment>) => apiRequest<Equipment>('POST', '/equipment', data),
    update: (id: string, data: Partial<Equipment>) => apiRequest<Equipment>('PUT', `/equipment/${id}`, data),
    delete: (id: string) => apiRequest<void>('DELETE', `/equipment/${id}`),
  },

  // Alert operations
  alerts: {
    getAll: () => apiRequest<Alert[]>('GET', '/alerts'),
    getById: (id: string) => apiRequest<Alert>('GET', `/alerts/${id}`),
    create: (data: Partial<Alert>) => apiRequest<Alert>('POST', '/alerts', data),
    update: (id: string, data: Partial<Alert>) => apiRequest<Alert>('PUT', `/alerts/${id}`, data),
    delete: (id: string) => apiRequest<void>('DELETE', `/alerts/${id}`),
    acknowledge: (id: string) => apiRequest<Alert>('PATCH', `/alerts/${id}/acknowledge`, {}),
  },

  // Access log operations
  accessLogs: {
    getAll: (params?: { userId?: string; limit?: number; offset?: number }) =>
      apiRequest<AccessLog[]>('GET', '/access-logs', undefined, { params }),
    getById: (id: string) => apiRequest<AccessLog>('GET', `/access-logs/${id}`),
  },

  // Metrics operations
  metrics: {
    getAll: (params?: { type?: string; startDate?: string; endDate?: string }) =>
      apiRequest<Metric[]>('GET', '/metrics', undefined, { params }),
    getById: (id: string) => apiRequest<Metric>('GET', `/metrics/${id}`),
    create: (data: Partial<Metric>) => apiRequest<Metric>('POST', '/metrics', data),
  },

  // Dashboard stats
  stats: {
    getOverview: () => apiRequest<{
      totalCameras: number;
      onlineCameras: number;
      totalZones: number;
      activeAlerts: number;
      temperature: number;
      power: number;
      uptime: number;
    }>('GET', '/stats/overview'),
    
    getEquipmentStatus: () => apiRequest<{
      total: number;
      active: number;
      inactive: number;
      maintenance: number;
      failed: number;
    }>('GET', '/stats/equipment'),
  },
};

export default api;