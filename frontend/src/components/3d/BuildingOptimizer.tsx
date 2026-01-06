import React, { useRef, useEffect, useMemo } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/*  BUILDING OPTIMIZER – design « infographics » – matériaux réels    */
/* ------------------------------------------------------------------ */

const BuildingOptimizer: React.FC = () => {
  const buildingRef = useRef<THREE.Group>(null);

  // Charger le modèle OBJ
  const obj = useLoader(OBJLoader, '/models/building/base.obj');

  // Matériaux réalistes
  const materials = useMemo(() => ({
    concrete: new THREE.MeshStandardMaterial({
      color: '#3c3c3c',
      roughness: 0.9,
      metalness: 0.1,
      normalScale: new THREE.Vector2(0.5, 0.5),
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color: '#cce4ff',
      transmission: 0.8,
      thickness: 1.2,
      roughness: 0.05,
      metalness: 0,
      ior: 1.5,
    }),
    steel: new THREE.MeshStandardMaterial({
      color: '#a0a0a0',
      metalness: 0.9,
      roughness: 0.25,
    }),
    led: new THREE.MeshStandardMaterial({
      color: '#00ffff',
      emissive: '#00ffff',
      emissiveIntensity: 1,
    }),
  }), []);

  useEffect(() => {
    if (!obj || !buildingRef.current) return;

    obj.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        const name = child.name.toLowerCase();
        if (name.includes('glass')) child.material = materials.glass;
        else if (name.includes('steel') || name.includes('frame')) child.material = materials.steel;
        else child.material = materials.concrete;

        child.material.needsUpdate = true;
      }
    });

    buildingRef.current.add(obj);
  }, [obj, materials]);

  return (
    <group ref={buildingRef}>
      <primitive object={obj} />
      <BuildingAdditions materials={materials} />
    </group>
  );
};

/* ------------------------------------------------------------------ */
/*  ÉLÉMENTS SUPPLÉMENTAIRES – refroidissement, signage, LEDs         */
/* ------------------------------------------------------------------ */
const BuildingAdditions: React.FC<{ materials: Record<string, THREE.Material> }> = ({ materials }) => {
  const fanRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (fanRef.current) fanRef.current.rotation.y += delta * 2;
  });

  const coolingPositions = useMemo(() => [...Array(8)].map((_, i) => [-30 + i * 8, 22, -20] as [number, number, number]), []);
  const cameraPositions = useMemo(() => [
    { pos: [-40, 15, -30] as [number, number, number], rotY: Math.PI / 4 },
    { pos: [40, 15, -30] as [number, number, number], rotY: -Math.PI / 4 },
    { pos: [-40, 15, 30] as [number, number, number], rotY: 3 * Math.PI / 4 },
    { pos: [40, 15, 30] as [number, number, number], rotY: -3 * Math.PI / 4 },
  ], []);

  return (
    <group>
            {/* Cooling units */}
      {coolingPositions.map((pos, i) => (
        <group key={`cool-${i}`} position={pos}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[6, 3, 6]} />
            <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.4} />
          </mesh>
          <group ref={i === 0 ? fanRef : undefined} position={[0, 1.5, 0]}>
            <mesh>
              <cylinderGeometry args={[2.5, 2.5, 0.2, 6]} />
              <meshStandardMaterial color="#1a202c" />
            </mesh>
            <mesh position={[0, 1.5, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.3, 8]} />
              <primitive object={materials.led} />
            </mesh>
          </group>
        </group>
      ))}

      {/* 3D signage */}
      {[-25, -8, 8, 25].map((x, i) => (
        <mesh key={`sign-${i}`} position={[x, 18, 20.3]} rotation={[-0.1, 0, 0]}>
          <boxGeometry args={[5, 1.5, 0.2]} />
          <meshStandardMaterial color="#1e40af" emissive="#1e40af" emissiveIntensity={0.6} />
        </mesh>
      ))}

      {/* LED strips façade */}
      {[-20, -6, 6, 20].map((x, i) => (
        <mesh key={`led-${i}`} position={[x, 16, 20.4]}>
          <boxGeometry args={[0.3, 12, 0.2]} />
          <primitive object={materials.led} />
        </mesh>
      ))}

      {/* Entrance canopy */}
      <mesh position={[0, 5, 32]} castShadow receiveShadow>
        <boxGeometry args={[12, 0.3, 4]} />
        <meshStandardMaterial color="#1a202c" metalness={0.8} />
      </mesh>
    </group>
  );
};

export default BuildingOptimizer;

