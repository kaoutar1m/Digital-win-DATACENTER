import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { useAlertPositions, alertColors } from '../hooks/useAlertSystem';

// 3D Alert Visualization Component
const AlertVisualization: React.FC = () => {
  const alertsWithPositions = useAlertPositions();

  return (
    <>
      {alertsWithPositions.map((alert) => (
        <group key={alert.id} position={[alert.position!.x, alert.position!.y, alert.position!.z]}>
          {/* Alert sphere */}
          <mesh>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial
              color={alertColors[alert.level]}
              emissive={alertColors[alert.level]}
              emissiveIntensity={alert.acknowledged ? 0.2 : 0.5}
            />
          </mesh>

          {/* Alert text */}
          <Text
            position={[0, 0.8, 0]}
            fontSize={0.2}
            color="white"
            anchorX="center"
            anchorY="middle"
            maxWidth={3}
          >
            {alert.level.toUpperCase()}
          </Text>

          {/* Pulsing effect for unacknowledged alerts */}
          {!alert.acknowledged && (
            <mesh scale={[1.2, 1.2, 1.2]}>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial
                color={alertColors[alert.level]}
                transparent
                opacity={0.3}
                emissive={alertColors[alert.level]}
                emissiveIntensity={0.8}
              />
            </mesh>
          )}
        </group>
      ))}
    </>
  );
};

const MinimalScene: React.FC = () => {
  return (
    <div className="w-full h-screen bg-black">
      <Canvas camera={{ position: [5, 5, 5], fov: 75 }}>
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        {/* 3D Alert Visualizations */}
        <AlertVisualization />

        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>

        {/* Reference cube */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#00FF88" wireframe />
        </mesh>

        {/* Camera controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={20}
        />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 bg-black/80 text-white p-4 rounded-lg">
        <h2 className="text-lg font-bold mb-2">🚨 3D Alert System Demo</h2>
        <p className="text-sm text-gray-300">
          Alerts with 3D positions appear as colored spheres.<br/>
          Unacknowledged alerts pulse and glow.
        </p>
        <div className="mt-3 space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#FF6B6B]"></div>
            <span>Critical</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#FFD166]"></div>
            <span>Warning</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#4A90E2]"></div>
            <span>Info</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#00FF88]"></div>
            <span>Success</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinimalScene;
