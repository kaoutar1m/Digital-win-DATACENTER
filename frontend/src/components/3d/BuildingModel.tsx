import React, { useRef, useMemo } from 'react';
import { Grid } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

/* ------------------------------------------------------------------ */
/*  BUILDING MODEL – design « infographics » – clean & animated       */
/* ------------------------------------------------------------------ */

const BuildingModel: React.FC = () => {
  /* géométries & matériaux partagés */
  const geom = useMemo(() => ({
    wall: new THREE.BoxGeometry(100, 30, 80),
    glass: new THREE.PlaneGeometry(90, 25),
    roof: new THREE.BoxGeometry(102, 1, 82),
    cooler: new THREE.BoxGeometry(8, 3, 8),
    led: new THREE.SphereGeometry(0.2, 16, 16),
  }), []);

  const mat = useMemo(() => ({
    wall: new THREE.MeshStandardMaterial({ color: '#1a202c', metalness: 0.7, roughness: 0.3 }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#4299e1', transmission: 0.8, thickness: 0.5, roughness: 0.05 }),
    roof: new THREE.MeshStandardMaterial({ color: '#2d3748', metalness: 0.9, roughness: 0.2 }),
    cooler: new THREE.MeshStandardMaterial({ color: '#4a5568' }),
    led: new THREE.MeshStandardMaterial({ color: '#00ffff', emissive: '#00ffff' }),
  }), []);

  /* animation refroidissement */
  const fansRef = useRef<THREE.Group[]>([]);
  useFrame((_, delta) => {
    fansRef.current.forEach((fan) => fan && (fan.rotation.y += delta * 2));
  });

  return (
    <group>
      {/* 1. STRUCTURE PRINCIPALE */}
      <mesh geometry={geom.wall} material={mat.wall} position={[0, 15, 0]} castShadow receiveShadow />

      {/* 2. FAÇADE VITRÉE */}
      <mesh geometry={geom.glass} material={mat.glass} position={[0, 15, 40]} rotation={[0, 0, 0]} />

      {/* 3. TOIT TECHNIQUE */}
      <mesh geometry={geom.roof} material={mat.roof} position={[0, 30.5, 0]} castShadow receiveShadow />

            {/* 4. UNITÉS DE REFROIDISSEMENT (8 tours N+1) */}
      {[...Array(8)].map((_, i) => (
        <group key={`cool-${i}`} position={[-35 + i * 10, 19, -35]}>
          <mesh geometry={geom.cooler} material={mat.cooler} castShadow receiveShadow />
          <group ref={(el) => el && (fansRef.current[i] = el)} position={[0, 1.5, 0]}>
            <mesh>
              <cylinderGeometry args={[2.5, 2.5, 0.2, 6]} />
              <meshStandardMaterial color="#1a202c" />
            </mesh>
            <mesh geometry={geom.led} material={mat.led} position={[0, 3, 0]} />
          </group>
        </group>
      ))}

      {/* 5. ÉCLAIRAGE ARCHITECTURAL */}
      <pointLight position={[0, 25, 45]} intensity={80} color="#4299e1" distance={120} />

      {/* 6. SOL TECHNIQUE (dalles relevables) */}
      <Grid
        args={[80, 60]}
        position={[0, 0.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        cellSize={2}
        cellThickness={0.5}
        cellColor="#4a5568"
        sectionSize={10}
        sectionThickness={1}
        sectionColor="#2d3748"
        fadeDistance={100}
        fadeStrength={1}
        infiniteGrid
      />
    </group>
  );
};

export default BuildingModel;