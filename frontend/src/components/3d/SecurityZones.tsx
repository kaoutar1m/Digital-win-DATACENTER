import React, { useState, useRef, useMemo } from 'react';
import { Line, Text, Html } from '@react-three/drei';
import { useDataCenterStore } from '../../stores/dataCenterStore';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

/* ------------------------------------------------------------------ */
/*  CONFIGURATION DES ZONES - Design Premium Infographics             */
/* ------------------------------------------------------------------ */

const zoneMeta = {
  public: {
    color: '#10b981',
    glowColor: '#34d399',
    accentColor: '#6ee7b7',
    icon: '🟢',
    label: 'PUBLIC ZONE',
    description: 'Open Access Area',
    securityLevel: 'Level 1',
  },
  restricted: {
    color: '#f59e0b',
    glowColor: '#fbbf24',
    accentColor: '#fcd34d',
    icon: '🟠',
    label: 'RESTRICTED ZONE',
    description: 'Limited Access Required',
    securityLevel: 'Level 2',
  },
  sensitive: {
    color: '#ef4444',
    glowColor: '#f87171',
    accentColor: '#fca5a5',
    icon: '🔴',
    label: 'SENSITIVE ZONE',
    description: 'Authorized Personnel Only',
    securityLevel: 'Level 3',
  },
  critical: {
    color: '#8b5cf6',
    glowColor: '#a78bfa',
    accentColor: '#c4b5fd',
    icon: '🟣',
    label: 'CRITICAL ZONE',
    description: 'Maximum Security Protocol',
    securityLevel: 'Level 4',
  },
};

/* ================================================================== */
/*  COMPOSANT PRINCIPAL - Container avec monitoring                   */
/* ================================================================== */

const SecurityZones: React.FC = () => {
  const zones = useDataCenterStore((state) => state.zones);
  const [selected, setSelected] = useState<string | null>(null);
  const [monitoringMode, setMonitoringMode] = useState(false);

  const handleZoneClick = (zoneId: string) => {
    setSelected(selected === zoneId ? null : zoneId);
    setMonitoringMode(true);
    // Logique de monitoring à ajouter ici
    console.log(`Monitoring activé pour la zone : ${zoneId}`);
  };

  return (
    <group>
      {zones.map((z) => (
        <SecurityZone
          key={z.id}
          zone={z}
          selected={selected === z.id}
          onSelect={() => handleZoneClick(z.id)}
        />
      ))}
    </group>
  );
};

/* ================================================================== */
/*  ZONE INDIVIDUELLE - Titre cliquable + design premium              */
/* ================================================================== */

const SecurityZone: React.FC<{
  zone: any;
  selected: boolean;
  onSelect: () => void;
}> = ({ zone, selected, onSelect }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);

  const meta = zoneMeta[zone.security_level];
  const isActive = hovered || selected;

  /* Animation des effets visuels */
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    const pulse = Math.sin(t * 2) * 0.5 + 0.5;

    groupRef.current.children.forEach((child: any) => {
      if (child.userData?.isLED) {
        const phase = child.userData.phase || 0;
        child.material.emissiveIntensity = (Math.sin(t * 3 + phase) * 0.5 + 1) * (isActive ? 1.5 : 1);
      }
      if (child.userData?.isGlow) {
        child.material.opacity = (pulse * 0.3 + 0.2) * (isActive ? 1.2 : 1);
      }
      if (child.userData?.isGrid) {
        child.material.opacity = (pulse * 0.25 + 0.15) * (isActive ? 1.5 : 1);
      }
    });

    if (selected) {
      groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.02;
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.03;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[zone.position.x, zone.position.y, zone.position.z]}
      scale={selected ? 1.1 : isActive ? 1.05 : 1}
      onClick={onSelect}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* 1. Dalle principale */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[zone.width, zone.depth]} />
        <meshPhysicalMaterial
          color={meta.color}
          emissive={meta.glowColor}
          emissiveIntensity={isActive ? 0.6 : 0.3}
          transparent
          opacity={isActive ? 0.4 : 0.25}
          transmission={0.8}
          thickness={2}
          roughness={0.05}
          metalness={0.9}
          clearcoat={1}
          clearcoatRoughness={0.05}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* 2. Glow layers */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        userData={{ isGlow: true }}
      >
        <planeGeometry args={[zone.width * 0.9, zone.depth * 0.9]} />
        <meshBasicMaterial
          color={meta.accentColor}
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Grille holographique */}
      {[...Array(8)].map((_, i) => (
        <React.Fragment key={`grid-${i}`}>
          <Line
            points={[
              [-zone.width / 2, 0.015, -zone.depth / 2 + (i + 1) * (zone.depth / 9)],
              [zone.width / 2, 0.015, -zone.depth / 2 + (i + 1) * (zone.depth / 9)],
            ]}
            color={meta.glowColor}
            lineWidth={isActive ? 1 : 0.8}
            transparent
            opacity={0.25}
            userData={{ isGrid: true }}
          />
          <Line
            points={[
              [-zone.width / 2 + (i + 1) * (zone.width / 9), 0.015, -zone.depth / 2],
              [-zone.width / 2 + (i + 1) * (zone.width / 9), 0.015, zone.depth / 2],
            ]}
            color={meta.glowColor}
            lineWidth={isActive ? 1 : 0.8}
            transparent
            opacity={0.25}
            userData={{ isGrid: true }}
          />
        </React.Fragment>
      ))}

      {/* 4. Bordures néon */}
      <Line
        points={[
          [-zone.width / 2, 0.1, -zone.depth / 2],
          [zone.width / 2, 0.1, -zone.depth / 2],
          [zone.width / 2, 0.1, zone.depth / 2],
          [-zone.width / 2, 0.1, zone.depth / 2],
          [-zone.width / 2, 0.1, -zone.depth / 2],
        ]}
        color={isActive ? '#ffffff' : meta.glowColor}
        lineWidth={isActive ? 8 : 5}
      />

      {/* 5. LEDs corners */}
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz, idx) => (
          <group key={`led-${sx}-${sz}`} position={[sx * zone.width * 0.48, 0.15, sz * zone.depth * 0.48]}>
            <mesh userData={{ isLED: true, phase: idx * Math.PI / 2 }}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial
                color={meta.accentColor}
                emissive={meta.glowColor}
                emissiveIntensity={1.2}
                metalness={1}
                roughness={0}
              />
            </mesh>
            <pointLight color={meta.glowColor} intensity={isActive ? 3 : 1.5} distance={10} />
          </group>
        ))
      )}

      {/* 6. Titre cliquable */}
      <Html
        position={[0, 4, 0]}
        center
        distanceFactor={10}
        style={{
          pointerEvents: 'auto',
          cursor: 'pointer',
          fontSize: isActive ? '2.5rem' : '2rem',
          color: isActive ? '#ffffff' : meta.glowColor,
          filter: `drop-shadow(0 0 10px ${meta.glowColor})`,
          transition: 'all 0.3s ease',
          textShadow: `0 0 20px ${meta.glowColor}, 0 0 40px ${meta.color}`,
        }}
        onClick={onSelect}
      >
        <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
          {meta.icon} {meta.label}
        </div>
      </Html>

      {/* 7. Description */}
      <Text
        position={[0, 3, 0]}
        fontSize={0.8}
        color={meta.accentColor}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {meta.description}
      </Text>

      {/* 8. Security level */}
      <Text
        position={[0, 2.2, 0]}
        fontSize={0.6}
        color={meta.color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        {meta.securityLevel}
      </Text>

      {/* 9. Active info */}
      {selected && (
        <>
          <Text
            position={[0, 1.5, 0]}
            fontSize={0.5}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            {`Dimensions: ${zone.width}m × ${zone.depth}m`}
          </Text>
          <Text
            position={[0, 1, 0]}
            fontSize={0.5}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            Status: Active • Protected
          </Text>
        </>
      )}

      {/* 10. Shield effect when active */}
      {isActive && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[zone.width * 0.6, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial
            color={meta.glowColor}
            transparent
            opacity={0.1}
            transmission={0.9}
            thickness={1}
            roughness={0.1}
            metalness={0.5}
            clearcoat={1}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
};

export default SecurityZones;