import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Grid } from '@react-three/drei';
import BuildingModel from './3d/BuildingModel';
import DataCenterGenerator from './3d/DataCenterGenerator';
import SecurityZones from './3d/SecurityZones';
import CameraControls from './3d/CameraControls';
import AlertVisualization from './3d/AlertVisualization';
import { useAlertSystem } from '../hooks/useAlertSystem';

const DataCenterScene: React.FC = () => {
  const { alerts } = useAlertSystem();

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [20, 20, 20], fov: 75 }}
        style={{ background: '#0f172a' }}
      >
        <Environment preset="warehouse" background />
        <Grid args={[100, 100]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        <BuildingModel />
        <DataCenterGenerator />
        <SecurityZones />
        <CameraControls />

        {/* Render active alerts */}
        {alerts.filter(alert => !alert.acknowledged).map(alert => (
          <AlertVisualization key={alert.id} alert={alert} />
        ))}
      </Canvas>
    </div>
  );
};

export default DataCenterScene;