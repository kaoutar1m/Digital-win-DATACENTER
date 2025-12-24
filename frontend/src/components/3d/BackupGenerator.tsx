import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BackupGeneratorProps {
  position?: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
  isActive?: boolean;
}

const BackupGenerator: React.FC<BackupGeneratorProps> = ({
  position = [0, 0, 0],
  scale = [1, 1, 1],
  rotation = [0, 0, 0],
  isActive = false
}) => {
  const meshRef = useRef<THREE.Group>(null);

  // Charger le modèle GLB
  const { scene } = useGLTF('/models/interior/infrastructure/backup-generator.glb');

  // Animation pour simuler le fonctionnement
  useFrame((state) => {
    if (meshRef.current && isActive) {
      // Légère vibration quand actif
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 10) * 0.01;
    }
  });

  return (
    <group
      ref={meshRef}
      position={position}
      scale={scale}
      rotation={rotation}
    >
      <primitive object={scene} />

      {/* Effets visuels quand actif */}
      {isActive && (
        <>
          {/* Lumière d'indication */}
          <pointLight
            position={[0, 2, 0]}
            intensity={2}
            color="#00ff00"
            distance={5}
          />

          {/* Particules de chaleur simulées */}
          <mesh position={[0, 1.5, -1]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial
              color="#ff4500"
              transparent
              opacity={0.6}
            />
          </mesh>
        </>
      )}

      {/* Indicateur d'état */}
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.2]} />
        <meshStandardMaterial
          color={isActive ? "#00ff00" : "#ff0000"}
          emissive={isActive ? "#004400" : "#440000"}
        />
      </mesh>
    </group>
  );
};

// Préchargement du modèle
useGLTF.preload('/models/interior/infrastructure/backup-generator.glb');

export default BackupGenerator;
