import { useEffect } from 'react';
import { useDataCenterStore } from '../stores/dataCenterStore';

const API_BASE_URL = 'http://localhost:3001/api';

export const useDataCenterData = () => {
  const { zones, racks, sensors, equipment, setZones, setRacks, setSensors, setEquipment } = useDataCenterStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch zones
        const zonesResponse = await fetch(`${API_BASE_URL}/zones`);
        if (zonesResponse.ok) {
          const zones = await zonesResponse.json();
          setZones(zones);
        }

        // Fetch racks
        const racksResponse = await fetch(`${API_BASE_URL}/racks`);
        if (racksResponse.ok) {
          const racks = await racksResponse.json();
          setRacks(racks);
        }

        // Fetch sensors
        const sensorsResponse = await fetch(`${API_BASE_URL}/sensors`);
        if (sensorsResponse.ok) {
          const sensors = await sensorsResponse.json();
          setSensors(sensors);
        }

        // Fetch equipment
        const equipmentResponse = await fetch(`${API_BASE_URL}/equipment`);
        if (equipmentResponse.ok) {
          const equipment = await equipmentResponse.json();
          setEquipment(equipment);
        }
      } catch (error) {
        console.error('Failed to fetch data center data:', error);
      }
    };

    fetchData();
  }, [setZones, setRacks, setSensors, setEquipment]);

  return { racks, sensors, zones, equipment };
};
