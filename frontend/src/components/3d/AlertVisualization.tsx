import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

import { Mesh } from 'three';
import { FaExclamationTriangle } from 'react-icons/fa';
import { Alert, alertColors } from '../../hooks/useAlertSystem';

interface AlertVisualizationProps {
  alert: Alert;
}

const AlertVisualization: React.FC<AlertVisualizationProps> = ({ alert }) => {
  const meshRef = useRef<Mesh>(null);
  const position = alert.position || { x: 0, y: 0, z: 0 };

  useFrame((state) => {
    if (meshRef.current) {
      // Pulsing effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
      meshRef.current.scale.setScalar(scale);

      // Rotate slowly
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Pulsing sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 16, 16]} />
        <meshBasicMaterial
          color={alertColors[alert.level]}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Floating icon */}
      <Html center occlude>
        <div className="alert-icon bg-white rounded-full p-2 shadow-lg">
          <FaExclamationTriangle
            size={24}
            color={alertColors[alert.level]}
          />
        </div>
      </Html>
    </group>
  );
};

export default AlertVisualization;
