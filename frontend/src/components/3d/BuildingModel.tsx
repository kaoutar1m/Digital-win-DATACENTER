import React from 'react';
import { Grid } from '@react-three/drei';

const BuildingModel = () => {
  return (
    <group>
      {/* Structure principale */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[100, 30, 80]} />
        <meshStandardMaterial
          color="#1a365d"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      
      {/* Façade vitrée */}
      <mesh position={[0, 5, 40]} >
        <planeGeometry args={[90, 25]} />
        <meshPhysicalMaterial
          color="#4299e1"
          transmission={0.9}
          thickness={0.5}
          roughness={0.1}
        />
      </mesh>
      
      {/* Toit technique */}
      <mesh position={[0, 17, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[102, 1, 82]} />
        <meshStandardMaterial
          color="#2d3748"
          metalness={1}
          roughness={0.2}
        />
      </mesh>
      
      {/* Unités de refroidissement */}
      {[...Array(8)].map((_, i) => (
        <mesh key={i} position={[-40 + i * 11, 18, -35]}>
          <boxGeometry args={[8, 3, 8]} />
          <meshStandardMaterial color="#4a5568" />
        </mesh>
      ))}
      
      {/* Éclairage architectural */}
      <pointLight position={[0, 10, 35]} intensity={50} color="#4299e1" />
      
      {/* Intérieur visible */}
      <Grid 
        args={[80, 60]}
        cellSize={2}
        cellThickness={0.5}
        cellColor="#4a5568"
        sectionSize={10}
        sectionThickness={1}
        sectionColor="#2d3748"
        fadeDistance={100}
        fadeStrength={1}
      />
    </group>
  )
}

export default BuildingModel;
