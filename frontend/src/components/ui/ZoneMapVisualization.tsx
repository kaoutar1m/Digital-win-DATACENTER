import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { FaExpand, FaCompress, FaEye, FaEyeSlash, FaLayerGroup } from 'react-icons/fa';

interface Zone {
  id: string;
  name: string;
  type: 'public' | 'restricted' | 'sensitive' | 'critical';
  security_level: number;
  location: string;
  access_points: number;
  authorized_users: number;
  sensors: number;
  status: 'active' | 'maintenance' | 'inactive';
  color: string;
  position: { x: number; y: number; z: number };
  created_at: Date;
  updated_at?: Date;
}

interface ZoneMapVisualizationProps {
  zones: Zone[];
  selectedZone?: Zone | null;
  onZoneSelect?: (zone: Zone) => void;
  onZoneHover?: (zone: Zone | null) => void;
}

const ZoneCube: React.FC<{
  zone: Zone;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
}> = ({ zone, isSelected, isHovered, onClick, onPointerOver, onPointerOut }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle floating animation
      meshRef.current.position.y = zone.position.y + Math.sin(state.clock.elapsedTime + zone.position.x) * 0.05;

      // Rotation for active zones
      if (zone.status === 'active') {
        meshRef.current.rotation.y += 0.005;
      }

      // Scale animation for selected/hovered zones
      const targetScale = (isSelected || isHovered) ? 1.2 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  const getZoneColor = () => {
    if (isSelected) return new THREE.Color(zone.color).lerp(new THREE.Color('#ffffff'), 0.3);
    if (isHovered) return new THREE.Color(zone.color).lerp(new THREE.Color('#ffffff'), 0.2);
    return new THREE.Color(zone.color);
  };

  const getZoneOpacity = () => {
    if (zone.status === 'inactive') return 0.3;
    if (zone.status === 'maintenance') return 0.7;
    return 0.9;
  };

  const getZoneSize = () => {
    const baseSize = 1;
    const securityMultiplier = zone.security_level * 0.2;
    return baseSize + securityMultiplier;
  };

  return (
    <group position={[zone.position.x, zone.position.y, zone.position.z]}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => {
          setHovered(true);
          onPointerOver();
        }}
        onPointerOut={() => {
          setHovered(false);
          onPointerOut();
        }}
      >
        <boxGeometry args={[getZoneSize(), getZoneSize(), getZoneSize()]} />
        <meshStandardMaterial
          color={getZoneColor()}
          transparent
          opacity={getZoneOpacity()}
          emissive={isSelected ? new THREE.Color(zone.color).multiplyScalar(0.2) : new THREE.Color(0x000000)}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </mesh>

      {/* Zone label */}
      <Html position={[0, getZoneSize() / 2 + 0.5, 0]} center>
        <div className="bg-black/80 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
          {zone.name}
        </div>
      </Html>

      {/* Status indicator */}
      <mesh position={[getZoneSize() / 2 + 0.2, 0, 0]}>
        <sphereGeometry args={[0.1]} />
        <meshBasicMaterial
          color={
            zone.status === 'active' ? '#00FF88' :
            zone.status === 'maintenance' ? '#FFA500' :
            '#666666'
          }
        />
      </mesh>

      {/* Security level indicator */}
      {Array.from({ length: zone.security_level }, (_, i) => (
        <mesh key={i} position={[-getZoneSize() / 2 - 0.2, getZoneSize() / 2 - i * 0.15, 0]}>
          <boxGeometry args={[0.05, 0.05, 0.05]} />
          <meshBasicMaterial color="#FFD700" />
        </mesh>
      ))}
    </group>
  );
};

const Scene: React.FC<{
  zones: Zone[];
  selectedZone?: Zone | null;
  onZoneSelect?: (zone: Zone) => void;
  onZoneHover?: (zone: Zone | null) => void;
}> = ({ zones, selectedZone, onZoneSelect, onZoneHover }) => {
  const { camera } = useThree();
  const [hoveredZone, setHoveredZone] = useState<Zone | null>(null);

  useEffect(() => {
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[-10, -10, -5]} intensity={0.3} />

      {/* Grid floor */}
      <gridHelper args={[20, 20, '#333333', '#222222']} />

      {/* Zones */}
      {zones.map((zone) => (
        <ZoneCube
          key={zone.id}
          zone={zone}
          isSelected={selectedZone?.id === zone.id}
          isHovered={hoveredZone?.id === zone.id}
          onClick={() => onZoneSelect?.(zone)}
          onPointerOver={() => {
            setHoveredZone(zone);
            onZoneHover?.(zone);
          }}
          onPointerOut={() => {
            setHoveredZone(null);
            onZoneHover?.(null);
          }}
        />
      ))}

      {/* Coordinate system labels */}
      <Text position={[11, 0, 0]} fontSize={0.5} color="#666666">X</Text>
      <Text position={[0, 11, 0]} fontSize={0.5} color="#666666">Y</Text>
      <Text position={[0, 0, 11]} fontSize={0.5} color="#666666">Z</Text>

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={50}
        minDistance={5}
      />
    </>
  );
};

const ZoneMapVisualization: React.FC<ZoneMapVisualizationProps> = ({
  zones,
  selectedZone,
  onZoneSelect,
  onZoneHover
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const stats = {
    total: zones.length,
    active: zones.filter(z => z.status === 'active').length,
    critical: zones.filter(z => z.type === 'critical').length,
    byType: {
      public: zones.filter(z => z.type === 'public').length,
      restricted: zones.filter(z => z.type === 'restricted').length,
      sensitive: zones.filter(z => z.type === 'sensitive').length,
      critical: zones.filter(z => z.type === 'critical').length,
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#1A1F2E] to-[#0F1419] border border-gray-800/50 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
        <div>
          <h3 className="text-lg font-semibold text-white">Zone Map Visualization</h3>
          <p className="text-gray-400 text-sm">3D spatial representation of security zones</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`p-2 rounded-lg transition-colors ${
              showLabels ? 'bg-[#00FF88]/20 text-[#00FF88]' : 'bg-gray-800/50 text-gray-400'
            }`}
            title={showLabels ? 'Hide Labels' : 'Show Labels'}
          >
            {showLabels ? <FaEye /> : <FaEyeSlash />}
          </button>

          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-lg transition-colors ${
              showGrid ? 'bg-[#00FF88]/20 text-[#00FF88]' : 'bg-gray-800/50 text-gray-400'
            }`}
            title={showGrid ? 'Hide Grid' : 'Show Grid'}
          >
            <FaLayerGroup />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="px-4 py-2 bg-gray-900/30 border-b border-gray-800/50">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#00FF88] rounded-full"></div>
            <span className="text-gray-400">Active:</span>
            <span className="text-white font-medium">{stats.active}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-gray-400">Critical:</span>
            <span className="text-white font-medium">{stats.critical}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            <span className="text-gray-400">Total:</span>
            <span className="text-white font-medium">{stats.total}</span>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <div ref={containerRef} className={`${isFullscreen ? 'h-screen' : 'h-96'} relative`}>
        <Canvas camera={{ position: [10, 10, 10], fov: 60 }}>
          <Scene
            zones={zones}
            selectedZone={selectedZone}
            onZoneSelect={onZoneSelect}
            onZoneHover={onZoneHover}
          />
        </Canvas>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-black/80 rounded-lg p-3 text-xs">
          <div className="text-white font-medium mb-2">Legend</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#00FF88] rounded"></div>
              <span className="text-gray-300">Active Zone</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded"></div>
              <span className="text-gray-300">Maintenance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded"></div>
              <span className="text-gray-300">Inactive Zone</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-gray-300">Critical Zone</span>
            </div>
          </div>
        </div>

        {/* Controls Help */}
        <div className="absolute top-4 right-4 bg-black/80 rounded-lg p-3 text-xs">
          <div className="text-white font-medium mb-2">Controls</div>
          <div className="text-gray-300 space-y-1">
            <div>🖱️ Click: Select zone</div>
            <div>🔄 Drag: Rotate view</div>
            <div>🔍 Scroll: Zoom</div>
          </div>
        </div>
      </div>

      {/* Zone Type Breakdown */}
      <div className="p-4 border-t border-gray-800/50">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-400">{stats.byType.public}</div>
            <div className="text-xs text-gray-500">Public</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#00FF88]">{stats.byType.restricted}</div>
            <div className="text-xs text-gray-500">Restricted</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-400">{stats.byType.sensitive}</div>
            <div className="text-xs text-gray-500">Sensitive</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-400">{stats.byType.critical}</div>
            <div className="text-xs text-gray-500">Critical</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZoneMapVisualization;
