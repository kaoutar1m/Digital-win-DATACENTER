import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Environment, Grid } from '@react-three/drei';
import * as THREE from 'three';
import BuildingModel from './3d/BuildingModel';
import DataCenterGenerator from './3d/DataCenterGenerator';
import SecurityZones from './3d/SecurityZones';
import CameraControls from './3d/CameraControls';
import AlertVisualization from './3d/AlertVisualization';
import RackDetailModal from './ui/RackDetailModal';
import EquipmentModal from './ui/EquipmentModal';
import { useAlertSystem } from '../hooks/useAlertSystem';
import { useDataCenterData } from '../hooks/useDataCenterData';

/* ------------------------------------------------------------------ */
/*  TYPES STRICTS                                                     */
/* ------------------------------------------------------------------ */
type RackData = { 
  rackId: string; 
  rackType: string;
  type: 'rack';
};

type CameraData = {
  cameraType: string;
  type: 'camera';
};

type EquipmentData = {
  equipmentType: string;
  type: 'equipment';
};

interface DataCenterSceneProps {
  onRackSelect?: (rackData: RackData | null) => void;
}

const DataCenterScene: React.FC<DataCenterSceneProps> = ({ onRackSelect }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { rackId } = useParams<{ rackId: string }>();
  const { alerts } = useAlertSystem();
  useDataCenterData();

  const [selectedRack, setSelectedRack] = useState<RackData | null>(null);
  const [selectedCamera, setSelectedCamera] = useState<CameraData | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentData | null>(null);
  const [showPanel, setShowPanel] = useState<boolean>(false);
  const [showRackModal, setShowRackModal] = useState<boolean>(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState<boolean>(false);

  // Handle URL-based rack selection
  useEffect(() => {
    if (rackId) {
      const rackData: RackData = {
        rackId,
        rackType: 'standard',
        type: 'rack'
      };
      setSelectedRack(rackData);
      setSelectedCamera(null);
      setShowRackModal(true);
      onRackSelect?.(rackData);
    } else {
      setShowRackModal(false);
    }
  }, [rackId, onRackSelect]);

  /* gestion centralisée des clics */
  const handleObjectClick = useCallback((event: THREE.Event) => {
    event.stopPropagation();
    const object = event.object as THREE.Object3D;
    const data = object.userData;

    if (data?.type === 'rack') {
      const rackData = data as RackData;
      setSelectedRack(rackData);
      setSelectedCamera(null);
      setSelectedEquipment(null);
      setShowPanel(true);
      setShowRackModal(true);
      onRackSelect?.(rackData);
      // Navigate to rack model route
      navigate(`/rack/${rackData.rackId}`);
    } else if (data?.type === 'camera') {
      setSelectedCamera(data as CameraData);
      setSelectedRack(null);
      setSelectedEquipment(null);
      setShowPanel(true);
      onRackSelect?.(null);
    } else if (data?.type === 'equipment') {
      const equipmentData = data as EquipmentData;
      setSelectedEquipment(equipmentData);
      setSelectedRack(null);
      setSelectedCamera(null);
      setShowPanel(false);
      setShowEquipmentModal(true);
      onRackSelect?.(null);
    }
  }, [onRackSelect, navigate]);

  const handleMiss = useCallback(() => {
    setSelectedRack(null);
    setSelectedCamera(null);
    setSelectedEquipment(null);
    setShowPanel(false);
    setShowRackModal(false);
    setShowEquipmentModal(false);
  }, []);

  /* contenu selon la route */
  const sceneContent = useMemo(() => {
    switch (location.pathname) {
      case '/zones':
        return (
          <>
            <BuildingModel />
            <SecurityZones />
          </>
        );
      case '/racks':
        return <DataCenterGenerator onObjectClick={handleObjectClick} />;
      case '/security':
        return <SecurityZones />;
      default:
        return (
          <>
            <BuildingModel />
            <DataCenterGenerator onObjectClick={handleObjectClick} />
            <SecurityZones />
          </>
        );
    }
  }, [location.pathname, handleObjectClick]);

  return (
    <div className="w-full h-screen relative bg-gradient-to-br from-[#0b0f17] to-[#111827]">
      <Canvas
        camera={{ position: [20, 20, 20], fov: 60 }}
        shadows
        onPointerMissed={handleMiss}
      >
        <Environment preset="city" />
        <Grid args={[200, 200]} cellSize={5} sectionSize={25} fadeDistance={150} infiniteGrid />
        <ambientLight intensity={0.4} />
        <directionalLight position={[15, 20, 10]} intensity={1.2} castShadow />

        {sceneContent}
        <CameraControls />

        {/* Alerts */}
        {alerts.filter((a) => !a.acknowledged).map((alert) => (
          <AlertVisualization key={alert.id} alert={alert} />
        ))}
      </Canvas>

      {/* HUD – panneaux verre dépoli */}
      <HudPanel visible={!!selectedRack || !!selectedCamera || showPanel} onClose={handleMiss}>
        {selectedRack && <RackPanel data={selectedRack} />}
        {selectedCamera && <CameraPanel data={selectedCamera} />}
      </HudPanel>

      {/* Rack Detail Modal */}
      {showRackModal && selectedRack && (
        <RackDetailModal
          isOpen={showRackModal}
          onClose={handleMiss}
          rackData={{
            ...selectedRack,
            position: 'Salle A - Rangée 1',
            servers: 8,
            powerConsumption: 2.5,
            temperature: 24,
            status: 'active'
          }}
        />
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  COMPOSANTS HUD – verre + animations                             */
/* ------------------------------------------------------------------ */
interface HudPanelProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const HudPanel: React.FC<HudPanelProps> = ({ visible, onClose, children }) => {
  if (!visible) return null;

  return (
    <div className="absolute top-4 right-4 bg-gray-800/70 backdrop-blur-xl border border-gray-700/50 rounded-xl p-5 w-72 text-gray-100 shadow-2xl animate-fadeIn">
      <button 
        className="absolute top-2 right-3 bg-transparent border-none text-gray-300 text-xl cursor-pointer hover:text-white transition-colors"
        onClick={onClose}
      >
        ✕
      </button>
      {children}
    </div>
  );
};

const RackPanel: React.FC<{ data: RackData }> = ({ data }) => (
  <div className="space-y-3">
    <h3 className="text-lg font-semibold text-cyan-400 mb-3">Rack {data.rackId}</h3>
    <div className="space-y-2 text-sm">
      <p className="flex justify-between">
        <span className="text-gray-400">Type:</span>
        <span className="text-white">{data.rackType}</span>
      </p>
      <p className="flex justify-between">
        <span className="text-gray-400">Serveurs:</span>
        <span className="text-white">8 unités</span>
      </p>
      <p className="flex justify-between">
        <span className="text-gray-400">Consommation:</span>
        <span className="text-yellow-400">2.5 kW</span>
      </p>
      <p className="flex justify-between">
        <span className="text-gray-400">Température:</span>
        <span className="text-orange-400">24°C</span>
      </p>
    </div>
  </div>
);

const CameraPanel: React.FC<{ data: CameraData }> = ({ data }) => (
  <div className="space-y-3">
    <h3 className="text-lg font-semibold text-cyan-400 mb-3">Caméra de sécurité</h3>
    <div className="space-y-2 text-sm">
      <p className="flex justify-between">
        <span className="text-gray-400">Type:</span>
        <span className="text-white">{data.cameraType}</span>
      </p>
      <p className="flex justify-between">
        <span className="text-gray-400">Statut:</span>
        <span className="text-emerald-400">Active</span>
      </p>
      <p className="flex justify-between">
        <span className="text-gray-400">Zone:</span>
        <span className="text-white">Surveillance</span>
      </p>
    </div>
  </div>
);

export default DataCenterScene;