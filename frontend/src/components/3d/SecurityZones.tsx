import React, { useState } from 'react';
import { Line } from '@react-three/drei';
import { useDataCenterStore } from '../../stores/dataCenterStore';

const zoneColors = {
  public: '#38a169',
  restricted: '#ed8936',
  sensitive: '#e53e3e',
  critical: '#805ad5'
};

const SecurityZones: React.FC = () => {
  const zones = useDataCenterStore((state) => state.zones);
  const [selectedZone, setSelectedZone] = useState(null);

  return (
    <group>
      {zones.map((zone) => (
        <SecurityZone key={zone.id} zone={zone} onSelect={setSelectedZone} />
      ))}
    </group>
  );
};

const SecurityZone = ({ zone, onSelect }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <mesh
      position={[zone.position.x, zone.position.y, zone.position.z]}
      onClick={() => onSelect(zone)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[zone.width, 0.1, zone.depth]} />
      <meshPhysicalMaterial
        color={zoneColors[zone.security_level]}
        transparent
        opacity={0.3}
        transmission={0.5}
        thickness={2}
      />

      {/* Bordures */}
      <Line
        points={[
          [-zone.width/2, 0, -zone.depth/2],
          [zone.width/2, 0, -zone.depth/2],
          [zone.width/2, 0, zone.depth/2],
          [-zone.width/2, 0, zone.depth/2],
          [-zone.width/2, 0, -zone.depth/2]
        ]}
        color={zoneColors[zone.security_level]}
        lineWidth={3}
      />
    </mesh>
  );
};

export default SecurityZones;
