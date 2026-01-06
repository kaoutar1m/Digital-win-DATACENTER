import { useState, useCallback } from 'react';
import { apiService } from '../services/api';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends ApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    successMessage?: string;
  } = {}
): UseApiReturn<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (...args: any[]) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiFunction(...args);
      setState({ data: result, loading: false, error: null });

      if (options.onSuccess) {
        options.onSuccess(result);
      }

      if (options.showSuccessToast && options.successMessage) {
        // This will be replaced with actual toast implementation
        console.log('SUCCESS:', options.successMessage);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));

      if (options.onError) {
        options.onError(errorMessage);
      }

      if (options.showErrorToast) {
        // This will be replaced with actual toast implementation
        console.log('ERROR:', errorMessage);
      }

      return null;
    }
  }, [apiFunction, options]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Specialized hooks for common operations
export function useCameras() {
  const getAll = useApi(apiService.cameras.getAll, {
    showErrorToast: true,
  });

  const getById = useApi(apiService.cameras.getById, {
    showErrorToast: true,
  });

  const create = useApi(apiService.cameras.create, {
    showSuccessToast: true,
    successMessage: 'Camera created successfully',
    showErrorToast: true,
  });

  const update = useApi(apiService.cameras.update, {
    showSuccessToast: true,
    successMessage: 'Camera updated successfully',
    showErrorToast: true,
  });

  const remove = useApi(apiService.cameras.delete, {
    showSuccessToast: true,
    successMessage: 'Camera deleted successfully',
    showErrorToast: true,
  });

  return {
    cameras: getAll.data,
    camera: getById.data,
    loading: getAll.loading || getById.loading || create.loading || update.loading || remove.loading,
    error: getAll.error || getById.error || create.error || update.error || remove.error,
    getAllCameras: getAll.execute,
    getCameraById: getById.execute,
    createCamera: create.execute,
    updateCamera: update.execute,
    deleteCamera: remove.execute,
  };
}

export function useCameraEvents() {
  const getAll = useApi(apiService.cameraEvents.getAll, {
    showErrorToast: true,
  });

  const create = useApi(apiService.cameraEvents.create, {
    showSuccessToast: true,
    successMessage: 'Event logged successfully',
    showErrorToast: true,
  });

  const acknowledge = useApi(apiService.cameraEvents.update, {
    showSuccessToast: true,
    successMessage: 'Event acknowledged',
    showErrorToast: true,
  });

  return {
    events: getAll.data,
    loading: getAll.loading || create.loading || acknowledge.loading,
    error: getAll.error || create.error || acknowledge.error,
    getEvents: getAll.execute,
    createEvent: create.execute,
    acknowledgeEvent: acknowledge.execute,
  };
}

export function useZones() {
  const getAll = useApi(apiService.zones.getAll, {
    showErrorToast: true,
  });

  const create = useApi(apiService.zones.create, {
    showSuccessToast: true,
    successMessage: 'Zone created successfully',
    showErrorToast: true,
  });

  const update = useApi(apiService.zones.update, {
    showSuccessToast: true,
    successMessage: 'Zone updated successfully',
    showErrorToast: true,
  });

  const remove = useApi(apiService.zones.delete, {
    showSuccessToast: true,
    successMessage: 'Zone deleted successfully',
    showErrorToast: true,
  });

  return {
    zones: getAll.data,
    loading: getAll.loading || create.loading || update.loading || remove.loading,
    error: getAll.error || create.error || update.error || remove.error,
    getAllZones: getAll.execute,
    createZone: create.execute,
    updateZone: update.execute,
    deleteZone: remove.execute,
  };
}

export function useAlerts() {
  const getAll = useApi(apiService.alerts.getAll, {
    showErrorToast: true,
  });

  const acknowledge = useApi(apiService.alerts.acknowledge, {
    showSuccessToast: true,
    successMessage: 'Alert acknowledged',
    showErrorToast: true,
  });

  return {
    alerts: getAll.data,
    loading: getAll.loading || acknowledge.loading,
    error: getAll.error || acknowledge.error,
    getAlerts: getAll.execute,
    acknowledgeAlert: acknowledge.execute,
  };
}
