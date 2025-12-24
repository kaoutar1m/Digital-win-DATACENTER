import React, { useMemo, useRef, useState, useEffect, Suspense } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import BackupGenerator from './BackupGenerator';

const DataCenterGenerator = () => {
  const sceneRef = useRef<THREE.Group>(null);

  // Vérifier que le fichier GLB existe avant de charger
  const [buildingAvailable, setBuildingAvailable] = useState<boolean | null>(null);

  useEffect(() => {
  let cancelled = false;

  (async () => {
    try {
      const resp = await fetch("/models/building/exterior.glb", { method: "HEAD" });
      if (cancelled) return;

      if (!resp.ok) {
        setBuildingAvailable(false);
        return;
      }

      const len = resp.headers.get("content-length");
      if (len !== null && Number(len) === 0) {
        setBuildingAvailable(false);
        return;
      }

      setBuildingAvailable(true);
    } catch {
      if (!cancelled) setBuildingAvailable(false);
    }
  })();

  return () => {
    cancelled = true;
  };
}, []);


  // Créer un data center complet programmatiquement (le modèle du bâtiment
  // est rendu séparément par <BuildingModel /> pour respecter les Hooks)
  const dataCenter = useMemo(() => {
    const group = new THREE.Group();

    // Placeholder pour le bâtiment principal — le vrai modèle est ajouté
    // par le composant BuildingModel pour éviter d'appeler des hooks
    // conditionnellement.
    const buildingPlaceholder = new THREE.Group();
    buildingPlaceholder.name = 'building-placeholder';
    buildingPlaceholder.position.set(0, 0, 0);
    group.add(buildingPlaceholder);

    // 2. Sécurité périmétrique
    group.add(createPerimeterSecurity());

    // 3. Zones intérieures
    group.add(createInteriorZones());

    // 4. Infrastructure technique
    group.add(createTechnicalInfrastructure());

    // 5. Salles serveurs
    group.add(createServerRooms());

    // 6. Systèmes de sécurité
    group.add(createSecuritySystems());

    return group;
  }, []);

  useFrame((state) => {
    // Animations subtiles
    if (sceneRef.current) {
        // Pulsation des LEDs de sécurité
        sceneRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh && child.userData?.isSecurityLED) {
            const intensity = Math.sin(state.clock.elapsedTime * 3) * 0.5 + 0.5;
            if (child.material instanceof THREE.MeshStandardMaterial && 'emissive' in child.material) {
              child.material.emissiveIntensity = intensity;
            }
          }

          // Rotation des caméras PTZ
          if (child instanceof THREE.Object3D && child.userData?.isPTZCamera) {
            child.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
          }
        });
    }
  });

  return (
    <group ref={sceneRef}>
      <primitive object={dataCenter} />
      {buildingAvailable && (
        <Suspense fallback={null}>
          <BuildingModel />
        </Suspense>
      )}
      <BackupGenerator position={[-40, 0, 25] as [number, number, number]} isActive={true} />
    </group>
  );
};

// Composant enfant pour charger le GLB (respecte les Hooks)
const BuildingModel: React.FC = () => {
  const { scene } = useGLTF('/models/building/exterior.glb') as any;
  const ref = useRef<THREE.Group>(null);

  useEffect(() => {
    if (ref.current && scene) {
      try {
        ref.current.add(scene.clone());
      } catch (e) {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  return <group ref={ref} position={[0, 0, 0]} />;
};

// ==================== FONCTIONS DE GÉNÉRATION ====================

// 1. SÉCURITÉ PÉRIMÉTRIQUE
const createPerimeterSecurity = () => {
  const group = new THREE.Group();
  group.name = 'perimeter-security';

  // Clôture de sécurité
  const fenceGeometry = new THREE.BoxGeometry(100, 3, 2);
  const fenceMaterial = new THREE.MeshStandardMaterial({
    color: '#2d3748',
    metalness: 0.8,
    roughness: 0.4
  });

  // Clôture autour du bâtiment
  const positions = [
    [-51, 1.5, 0], [51, 1.5, 0],  // Nord/Sud
    [0, 1.5, -41], [0, 1.5, 41]   // Est/Ouest
  ];

  positions.forEach((pos, i) => {
    const fence = new THREE.Mesh(fenceGeometry, fenceMaterial);
    fence.position.set(pos[0], pos[1], pos[2]);
    fence.rotation.y = i < 2 ? 0 : Math.PI / 2;
    fence.castShadow = true;
    group.add(fence);
  });

  // Portails d'accès
  const gateGeometry = new THREE.BoxGeometry(4, 3, 0.2);
  const gateMaterial = new THREE.MeshStandardMaterial({
    color: '#1a365d',
    metalness: 0.9,
    roughness: 0.2
  });

  const mainGate = new THREE.Mesh(gateGeometry, gateMaterial);
  mainGate.position.set(0, 1.5, 41);
  mainGate.userData = { type: 'security-gate', isInteractive: true };
  group.add(mainGate);

  // Bornes de sécurité
  const bollardGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1, 8);
  const bollardMaterial = new THREE.MeshStandardMaterial({
    color: '#e53e3e',
    emissive: '#e53e3e',
    emissiveIntensity: 0.3
  });

  for (let x = -45; x <= 45; x += 10) {
    if (Math.abs(x) < 5) continue; // Laisser l'espace pour le portail

    const bollard = new THREE.Mesh(bollardGeometry, bollardMaterial);
    bollard.position.set(x, 0.5, 40);
    bollard.userData = { isSecurityLED: true };
    group.add(bollard);

    // Ajouter aussi de l'autre côté
    const bollard2 = bollard.clone();
    bollard2.position.z = -40;
    group.add(bollard2);
  }

  // Barrières rétractables
  const barrierGeometry = new THREE.BoxGeometry(6, 0.5, 0.3);
  const barrierMaterial = new THREE.MeshStandardMaterial({
    color: '#ed8936',
    emissive: '#ed8936',
    emissiveIntensity: 0.5
  });

  const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
  barrier.position.set(0, 0.25, 39);
  barrier.userData = { isSecurityLED: true, isInteractive: true };
  group.add(barrier);

  return group;
};

// 2. ZONES INTÉRIEURES
const createInteriorZones = () => {
  const group = new THREE.Group();
  group.name = 'interior-zones';

  // Zone d'accueil/réception
  const receptionZone = createZone('Réception', [-20, 0.1, 35], [15, 0.2, 10], '#38a169');
  receptionZone.userData.securityLevel = 'public';
  group.add(receptionZone);

  // Poste de sécurité
  const securityDesk = createSecurityDesk([-15, 0, 32]);
  group.add(securityDesk);

  // SAS de sécurité
  const airlockZone = createZone('SAS de Sécurité', [0, 0.1, 30], [8, 0.2, 4], '#ed8936');
  airlockZone.userData.securityLevel = 'restricted';
  group.add(airlockZone);

  // Zone publique
  const publicZone = createZone('Zone Publique', [-25, 0.1, 15], [20, 0.2, 25], '#38a169', 0.15);
  group.add(publicZone);

  // Zone restreinte
  const restrictedZone = createZone('Zone Restreinte', [0, 0.1, 10], [25, 0.2, 20], '#ed8936', 0.15);
  group.add(restrictedZone);

  // Zone sensible
  const sensitiveZone = createZone('Zone Sensible', [25, 0.1, 10], [20, 0.2, 20], '#e53e3e', 0.15);
  group.add(sensitiveZone);

  // Zone critique
  const criticalZone = createZone('Zone Critique', [0, 0.1, -15], [30, 0.2, 15], '#805ad5', 0.15);
  group.add(criticalZone);

  return group;
};

const createZone = (name: string, position: number[], size: [number, number, number], color: string, opacity = 0.3) => {
  const group = new THREE.Group();

  // Zone colorée au sol
  const zoneGeometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
  const zoneMaterial = new THREE.MeshPhysicalMaterial({
    color,
    transparent: true,
    opacity,
    transmission: 0.5,
    thickness: 1,
    side: THREE.DoubleSide
  });

  const zone = new THREE.Mesh(zoneGeometry, zoneMaterial);
  zone.position.set(position[0], position[1], position[2]);
  zone.rotation.x = -Math.PI / 2;
  group.add(zone);

  // Bordures de la zone
  const borderGeometry = new THREE.BoxGeometry(size[0] + 0.2, 0.1, size[2] + 0.2);
  const borderMaterial = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.8,
    wireframe: true
  });

  const border = new THREE.Mesh(borderGeometry, borderMaterial);
  border.position.set(position[0], position[1] + 0.05, position[2]);
  group.add(border);

  // Étiquette de zone
  const text = new THREE.Group();
  text.position.set(position[0], position[1] + 2, position[2]);
  text.userData = { isLabel: true, zoneName: name };
  group.add(text);

  return group;
};

const createSecurityDesk = (position: number[]) => {
  const group = new THREE.Group();
  group.position.set(position[0], position[1], position[2]);

  // Comptoir de sécurité
  const deskGeometry = new THREE.BoxGeometry(4, 1, 2);
  const deskMaterial = new THREE.MeshStandardMaterial({
    color: '#2d3748',
    metalness: 0.7,
    roughness: 0.4
  });

  const desk = new THREE.Mesh(deskGeometry, deskMaterial);
  desk.position.y = 0.5;
  group.add(desk);

  // Écrans de surveillance
  const screenGeometry = new THREE.BoxGeometry(3, 0.8, 0.1);
  const screenMaterial = new THREE.MeshStandardMaterial({
    color: '#0f172a',
    emissive: '#4299e1',
    emissiveIntensity: 0.3
  });

  const screen = new THREE.Mesh(screenGeometry, screenMaterial);
  screen.position.set(0, 1.2, 0.6);
  group.add(screen);

  // Chaise de sécurité
  const chairGeometry = new THREE.BoxGeometry(0.8, 1, 0.8);
  const chairMaterial = new THREE.MeshStandardMaterial({ color: '#4a5568' });

  const chair = new THREE.Mesh(chairGeometry, chairMaterial);
  chair.position.set(1.5, 0.5, -1);
  group.add(chair);

  return group;
};

// 3. INFRASTRUCTURE TECHNIQUE
const createTechnicalInfrastructure = () => {
  const group = new THREE.Group();
  group.name = 'technical-infrastructure';

  // Salle électrique
  const electricalRoom = createRoom('Salle Électrique', [40, 0, 30], [8, 4, 10], '#e53e3e');
  group.add(electricalRoom);

  // Ajouter des transformateurs
  for (let i = 0; i < 3; i++) {
    const transformer = createTransformer([38 + i * 3, 0.5, 28]);
    group.add(transformer);
  }

  // Groupes électrogènes
  const generatorRoom = createRoom('Groupes Électrogènes', [-40, 0, 30], [8, 4, 12], '#ed8936');
  group.add(generatorRoom);

  for (let i = 0; i < 2; i++) {
    const generator = createGenerator([-42 + i * 4, 0.5, 28]);
    group.add(generator);
  }

  // Système de refroidissement
  const coolingRoom = createRoom('Refroidissement', [40, 0, -30], [10, 5, 8], '#4299e1');
  group.add(coolingRoom);

  // Tours de refroidissement
  for (let i = 0; i < 4; i++) {
    const coolingTower = createCoolingTower([36 + i * 3, 0.5, -32]);
    group.add(coolingTower);
  }

  // Salle des serveurs de gestion
  const managementRoom = createRoom('Salle de Contrôle', [-40, 0, -30], [12, 4, 10], '#38a169');
  group.add(managementRoom);

  return group;
};

const createRoom = (name: string, position: number[], size: [number, number, number], color: string) => {
  const group = new THREE.Group();
  group.position.set(position[0], position[1], position[2]);

  // Structure de la salle
  const roomGeometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
  const roomMaterial = new THREE.MeshStandardMaterial({
    color,
    transparent: true,
    opacity: 0.7,
    metalness: 0.5,
    roughness: 0.5
  });

  const room = new THREE.Mesh(roomGeometry, roomMaterial);
  group.add(room);

  // Porte
  const doorGeometry = new THREE.BoxGeometry(2, 3, 0.2);
  const doorMaterial = new THREE.MeshStandardMaterial({
    color: '#1a202c',
    metalness: 0.9
  });

  const door = new THREE.Mesh(doorGeometry, doorMaterial);
  door.position.set(0, 1.5, size[2]/2 + 0.1);
  door.userData = { type: 'door', roomName: name, isInteractive: true };
  group.add(door);

  return group;
};

const createTransformer = (position: number[]) => {
  const group = new THREE.Group();
  group.position.set(position[0], position[1], position[2]);

  const baseGeometry = new THREE.BoxGeometry(2, 2, 2);
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: '#2d3748',
    metalness: 0.8
  });

  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  group.add(base);

  const topGeometry = new THREE.CylinderGeometry(0.8, 0.6, 1.5, 8);
  const topMaterial = new THREE.MeshStandardMaterial({
    color: '#e53e3e',
    metalness: 0.7
  });

  const top = new THREE.Mesh(topGeometry, topMaterial);
  top.position.y = 1.75;
  group.add(top);

  return group;
};

const createGenerator = (position: number[]) => {
  const group = new THREE.Group();
  group.position.set(position[0], position[1], position[2]);

  const generatorGeometry = new THREE.BoxGeometry(3, 2, 2);
  const generatorMaterial = new THREE.MeshStandardMaterial({
    color: '#d69e2e',
    metalness: 0.6
  });

  const generator = new THREE.Mesh(generatorGeometry, generatorMaterial);
  group.add(generator);

  // Échappement
  const exhaustGeometry = new THREE.CylinderGeometry(0.3, 0.2, 1, 8);
  const exhaustMaterial = new THREE.MeshStandardMaterial({
    color: '#4a5568'
  });

  const exhaust = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
  exhaust.position.set(0, 1.5, 1);
  exhaust.rotation.x = Math.PI / 2;
  group.add(exhaust);

  return group;
};

const createCoolingTower = (position: number[]) => {
  const group = new THREE.Group();
  group.position.set(position[0], position[1], position[2]);

  const towerGeometry = new THREE.CylinderGeometry(1, 1.5, 3, 8);
  const towerMaterial = new THREE.MeshStandardMaterial({
    color: '#4299e1',
    metalness: 0.7
  });

  const tower = new THREE.Mesh(towerGeometry, towerMaterial);
  group.add(tower);

  // Ventilateur
  const fanGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.2, 8);
  const fanMaterial = new THREE.MeshStandardMaterial({
    color: '#a0aec0'
  });

  const fan = new THREE.Mesh(fanGeometry, fanMaterial);
  fan.position.y = 1.6;
  group.add(fan);

  return group;
};

// 4. SALLES SERVEURS
const createServerRooms = () => {
  const group = new THREE.Group();
  group.name = 'server-rooms';

  // Configuration des rangées de racks
  const rackConfigs: { position: number[]; count: number; type: string; row: number }[] = [
    { position: [-25, 0, -10], count: 6, type: 'standard', row: 1 },
    { position: [-25, 0, 10], count: 6, type: 'storage', row: 2 },
    { position: [25, 0, -10], count: 6, type: 'network', row: 3 },
    { position: [25, 0, 10], count: 6, type: 'high-density', row: 4 }
  ];

  rackConfigs.forEach(config => {
    const rackRow = createRackRow(config);
    group.add(rackRow);
  });

  // Allées techniques
  const aisleGeometry = new THREE.BoxGeometry(60, 0.1, 4);
  const aisleMaterial = new THREE.MeshStandardMaterial({
    color: '#1a202c',
    metalness: 0.3,
    roughness: 0.8
  });

  const coldAisle = new THREE.Mesh(aisleGeometry, aisleMaterial);
  coldAisle.position.set(0, 0.05, 0);
  group.add(coldAisle);

  const hotAisle = new THREE.Mesh(aisleGeometry, aisleMaterial);
  hotAisle.position.set(0, 0.05, 20);
  group.add(hotAisle);

  // Plafond technique avec gainages
  const ceilingGeometry = new THREE.BoxGeometry(70, 0.5, 50);
  const ceilingMaterial = new THREE.MeshStandardMaterial({
    color: '#2d3748',
    metalness: 0.6
  });

  const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
  ceiling.position.set(0, 7, 5);
  group.add(ceiling);

  // Gainages d'air
  for (let x = -30; x <= 30; x += 10) {
    const duct = createAirDuct([x, 6.5, 5] as [number, number, number]);
    group.add(duct);
  }

  return group;
};

const createRackRow = ({ position, count, type }: { position: number[]; count: number; type: string; row: number }) => {
  const group = new THREE.Group();
  group.position.set(position[0], position[1], position[2]);

  const rackColors: { [key: string]: string } = {
    standard: '#4a5568',
    storage: '#38a169',
    network: '#4299e1',
    'high-density': '#805ad5'
  };

  for (let i = 0; i < count; i++) {
    const pos: [number, number, number] = [i * 8 - (count-1)*4, 0, 0];
    const rack = createServerRack(
      pos,
      rackColors[type],
      type,
      i
    );
    group.add(rack);
  }

  return group;
};

const createServerRack = (position: number[], color: string, type: string, index: number) => {
  const group = new THREE.Group();
  group.position.set(position[0], position[1], position[2]);
  group.userData = {
    type: 'server-rack',
    rackType: type,
    rackId: `RACK-${type.toUpperCase()}-${String(index+1).padStart(3, '0')}`,
    isInteractive: true
  };

  // Structure du rack
  const rackGeometry = new THREE.BoxGeometry(2, 6, 1);
  const rackMaterial = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.8,
    roughness: 0.3
  });

  const rack = new THREE.Mesh(rackGeometry, rackMaterial);
  rack.castShadow = true;
  group.add(rack);

  // Panneaux avant
  const panelGeometry = new THREE.BoxGeometry(1.8, 5.8, 0.05);
  const panelMaterial = new THREE.MeshStandardMaterial({
    color: '#1a202c',
    metalness: 0.9,
    roughness: 0.2
  });

  const frontPanel = new THREE.Mesh(panelGeometry, panelMaterial);
  frontPanel.position.z = 0.51;
  group.add(frontPanel);

  // Serveurs à l'intérieur
  for (let i = 0; i < 8; i++) {
    const pos: [number, number, number] = [0, -2 + i * 0.7, 0.3];
    const server = createServerUnit(pos, i);
    group.add(server);
  }

  // LEDs de statut
  const ledGeometry = new THREE.SphereGeometry(0.08, 8, 8);
  const ledMaterial = new THREE.MeshStandardMaterial({
    color: index === 2 ? '#e53e3e' : '#38a169',
    emissive: index === 2 ? '#e53e3e' : '#38a169',
    emissiveIntensity: 0.8
  });

  const led = new THREE.Mesh(ledGeometry, ledMaterial);
  led.position.set(0.9, 2.8, 0.6);
  led.userData = { isSecurityLED: true };
  group.add(led);

  // Étiquette du rack
  const labelGeometry = new THREE.PlaneGeometry(1, 0.3);
  const labelMaterial = new THREE.MeshBasicMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide
  });

  const label = new THREE.Mesh(labelGeometry, labelMaterial);
  label.position.set(0, 3.2, 0.6);
  label.rotation.y = Math.PI;
  group.add(label);

  return group;
};

const createServerUnit = (position: [number, number, number], index: number) => {
  const group = new THREE.Group();
  group.position.set(position[0], position[1], position[2]);

  const serverGeometry = new THREE.BoxGeometry(1.6, 0.5, 0.4);
  const serverMaterial = new THREE.MeshStandardMaterial({
    color: index % 2 === 0 ? '#2d3748' : '#4a5568',
    metalness: 0.7,
    roughness: 0.4
  });

  const server = new THREE.Mesh(serverGeometry, serverMaterial);
  group.add(server);

  // LEDs d'activité
  const activityLedGeometry = new THREE.SphereGeometry(0.03, 4, 4);
  const activityLedMaterial = new THREE.MeshStandardMaterial({
    color: Math.random() > 0.5 ? '#38a169' : '#a0aec0',
    emissive: Math.random() > 0.5 ? '#38a169' : '#a0aec0',
    emissiveIntensity: 0.5
  });

  const activityLed = new THREE.Mesh(activityLedGeometry, activityLedMaterial);
  activityLed.position.set(0.7, 0, 0.21);
  group.add(activityLed);

  return group;
};

const createAirDuct = (position: [number, number, number]) => {
  const group = new THREE.Group();
  group.position.set(position[0], position[1], position[2]);

  const ductGeometry = new THREE.CylinderGeometry(0.8, 0.8, 20, 8);
  const ductMaterial = new THREE.MeshStandardMaterial({
    color: '#4a5568',
    metalness: 0.8
  });

  const duct = new THREE.Mesh(ductGeometry, ductMaterial);
  duct.rotation.z = Math.PI / 2;
  group.add(duct);

  return group;
};

// 5. SYSTÈMES DE SÉCURITÉ
const createSecuritySystems = () => {
  const group = new THREE.Group();
  group.name = 'security-systems';

  // Caméras de surveillance intérieure
  const cameraPositions = [
    // Niveau sol
    [-35, 4, 35], [35, 4, 35], [-35, 4, -35], [35, 4, -35],
    // Niveau plafond
    [-35, 6, 0], [35, 6, 0], [0, 6, 35], [0, 6, -35],
    // Couloirs
    [-20, 4, 20], [20, 4, 20], [-20, 4, -20], [20, 4, -20]
  ];

  cameraPositions.forEach((pos, i) => {
    const camera = createSecurityCamera(pos, i < 4 ? 'dome' : 'ptz');
    group.add(camera);
  });

  // // Lecteurs de badge
  // const cardReaderPositions = [
  //   [0, 1.2, 36], [-15, 1.2, 36], [15, 1.2, 36],  // Entrée principale
  //   [0, 1.2, 30],                                  // SAS
  //   [-25, 1.2, 0], [25, 1.2, 0]                   // Zones restreintes
  // ];

  // cardReaderPositions.forEach(pos => {
  //   const reader = createCardReader(pos);
  //   group.add(reader);
  // });

  // // Scanner biométrique
  // const biometricScanner = createBiometricScanner([0, 0.8, 32]);
  // group.add(biometricScanner);

  // // Détecteur de métaux
  // const metalDetector = createMetalDetector([0, 0, 34] as [number, number, number]);
  // group.add(metalDetector);

  // // Tourniquets de sécurité
  // const turnstilePositions = [
  //   [0, 0, 35], [-15, 0, 35], [15, 0, 35],
  //   [0, 0, 29], [-25, 0, -5], [25, 0, -5]
  // ];

  // turnstilePositions.forEach((pos, i) => {
  // const turnstile = createTurnstile(pos as [number, number, number], i % 2 === 0);
  // group.add(turnstile);
  // });

  // // Système anti-incendie
  // group.add(createFireSuppressionSystem());

  // // Détecteurs de fumée
  // for (let x = -30; x <= 30; x += 15) {
  //   for (let z = -30; z <= 30; z += 15) {
  //     if (Math.abs(x) < 10 && Math.abs(z) < 10) continue;
  //     const smokeDetector = createSmokeDetector([x, 5, z] as [number, number, number]);
  //     group.add(smokeDetector);
  //   }
  // }

  // // Extincteurs
  // const extinguisherPositions: [number, number, number][] = [
  //   [-38, 0.5, 35], [38, 0.5, 35], [-38, 0.5, -35], [38, 0.5, -35],
  //   [0, 0.5, 25], [0, 0.5, -25]
  // ];

  // extinguisherPositions.forEach((pos: [number, number, number]) => {
  //   const extinguisher = createFireExtinguisher(pos);
  //   group.add(extinguisher);
  // });

  return group;
};

const createSecurityCamera = (position: number[], type: string = 'dome') => {
  const group = new THREE.Group();
  group.position.set(position[0], position[1], position[2]);
  group.userData = {
    type: 'security-camera',
    cameraType: type,
    isPTZCamera: type === 'ptz',
    isInteractive: true
  };

  // Support mural
  const mountGeometry = new THREE.BoxGeometry(0.3, 0.5, 0.3);
  const mountMaterial = new THREE.MeshStandardMaterial({
    color: '#4a5568',
    metalness: 0.8
  });

  const mount = new THREE.Mesh(mountGeometry, mountMaterial);
  mount.position.y = -0.25;
  group.add(mount);

  if (type === 'dome') {
    // Caméra dôme
    const domeGeometry = new THREE.SphereGeometry(0.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMaterial = new THREE.MeshPhysicalMaterial({
      color: '#1a202c',
      transmission: 0.9,
      thickness: 0.2,
      roughness: 0.1,
      metalness: 0.9
    });

    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    group.add(dome);

    // LED d'activité
    const ledGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const ledMaterial = new THREE.MeshStandardMaterial({
      color: '#e53e3e',
      emissive: '#e53e3e',
      emissiveIntensity: 0.8
    });

    const led = new THREE.Mesh(ledGeometry, ledMaterial);
    led.position.set(0, 0.1, 0.35);
    led.userData = { isSecurityLED: true };
    group.add(led);
  } else {
    // Caméra PTZ
    const baseGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: '#2d3748'
    });

    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    group.add(base);

    const cameraGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.5);
    const cameraMaterial = new THREE.MeshStandardMaterial({
      color: '#1a202c',
      metalness: 0.9
    });

    const camera = new THREE.Mesh(cameraGeometry, cameraMaterial);
    camera.position.z = 0.25;
    group.add(camera);

    // Lentille
    const lensGeometry = new THREE.CylinderGeometry(0.1, 0.15, 0.3, 8);
    const lensMaterial = new THREE.MeshPhysicalMaterial({
      color: '#000000',
      transmission: 0.95,
      roughness: 0
    });

    const lens = new THREE.Mesh(lensGeometry, lensMaterial);
    lens.position.set(0, 0, 0.5);
    lens.rotation.x = Math.PI / 2;
    group.add(lens);
  }

  return group;
};

const createCardReader = (position: number[]) => {
  const group = new THREE.Group();
  group.position.set(position[0], position[1], position[2]);
  group.userData = { type: 'card-reader', isInteractive: true };

  const readerGeometry = new THREE.BoxGeometry(0.4, 0.2, 0.1);
  const readerMaterial = new THREE.MeshStandardMaterial({
    color: '#2d3748',
    metalness: 0.9
  });

  const reader = new THREE.Mesh(readerGeometry, readerMaterial);
  group.add(reader);

  // Écran LED
  const screenGeometry = new THREE.BoxGeometry(0.35, 0.15, 0.02);
  const screenMaterial = new THREE.MeshStandardMaterial({
    color: '#0f172a',
    emissive: '#38a169',
    emissiveIntensity: 0.5
  });

  const screen = new THREE.Mesh(screenGeometry, screenMaterial);
  screen.position.z = 0.06;
  group.add(screen);

  return group;
};

const createBiometricScanner = (position: number[]) => {
  const group = new THREE.Group();
  group.position.set(position[0], position[1], position[2]);
  group.userData = { type: 'biometric-scanner', isInteractive: true };

  const scannerGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.3);
  const scannerMaterial = new THREE.MeshStandardMaterial({
    color: '#1a365d',
    metalness: 0.8
  });

  const scanner = new THREE.Mesh(scannerGeometry, scannerMaterial);
  group.add(scanner);

  // Surface de scan
  const scanSurfaceGeometry = new THREE.BoxGeometry(0.5, 0.3, 0.02);
  const scanSurfaceMaterial = new THREE.MeshPhysicalMaterial({
    color: '#4299e1',
    transmission: 0.7,
    roughness: 0.1
  });

  const scanSurface = new THREE.Mesh(scanSurfaceGeometry, scanSurfaceMaterial);
  scanSurface.position.z = 0.16;
  group.add(scanSurface);

  return group;
};

const createMetalDetector = (position: [number, number, number]) => {
  const group = new THREE.Group();
  group.position.set(...position);
  group.userData = { type: 'metal-detector', isInteractive: true };

  // Arches
  const archGeometry = new THREE.BoxGeometry(0.2, 3, 0.2);
  const archMaterial = new THREE.MeshStandardMaterial({
    color: '#4299e1',
    metalness: 0.7
  });

  const leftArch = new THREE.Mesh(archGeometry, archMaterial);
  leftArch.position.set(-1.5, 1.5, 0);
  group.add(leftArch);

  const rightArch = leftArch.clone();
  rightArch.position.x = 1.5;
  group.add(rightArch);

  // Arche supérieure
  const topArchGeometry = new THREE.BoxGeometry(3.2, 0.2, 0.2);
  const topArch = new THREE.Mesh(topArchGeometry, archMaterial);
  topArch.position.set(0, 3, 0);
  group.add(topArch);

  // Détecteur
  const detectorGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
  const detectorMaterial = new THREE.MeshStandardMaterial({
    color: '#e53e3e',
    emissive: '#e53e3e',
    emissiveIntensity: 0.3
  });

  const detector = new THREE.Mesh(detectorGeometry, detectorMaterial);
  detector.position.set(0, 2, 0);
  detector.userData = { isSecurityLED: true };
  group.add(detector);

  return group;
};

const createTurnstile = (position: [number, number, number], isActive: boolean = true) => {
  const group = new THREE.Group();
  group.position.set(...position);
  group.userData = { type: 'turnstile', isActive, isInteractive: true };

  // Base
  const baseGeometry = new THREE.CylinderGeometry(0.4, 0.4, 1, 8);
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: '#4a5568',
    metalness: 0.7
  });

  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  group.add(base);

  // Barres
  const barGeometry = new THREE.BoxGeometry(0.8, 0.05, 0.05);
  const barMaterial = new THREE.MeshStandardMaterial({
    color: isActive ? '#e53e3e' : '#a0aec0',
    emissive: isActive ? '#e53e3e' : undefined,
    emissiveIntensity: isActive ? 0.5 : 0
  });

  for (let i = 0; i < 3; i++) {
    const bar = new THREE.Mesh(barGeometry, barMaterial);
    bar.rotation.y = (i * Math.PI * 2) / 3;
    bar.userData = { isSecurityLED: isActive };
    group.add(bar);
  }

  // Indicateur d'accès
  const indicatorGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  const indicatorMaterial = new THREE.MeshStandardMaterial({
    color: isActive ? '#38a169' : '#e53e3e',
    emissive: isActive ? '#38a169' : '#e53e3e',
    emissiveIntensity: 0.8
  });

  const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
  indicator.position.y = 1.2;
  group.add(indicator);

  return group;
};

const createFireSuppressionSystem = () => {
  const group = new THREE.Group();
  group.name = 'fire-suppression';

  // Sprinklers au plafond
  for (let x = -30; x <= 30; x += 10) {
    for (let z = -30; z <= 30; z += 10) {
      const sprinkler = createSprinkler([x, 6.8, z]);
      group.add(sprinkler);
    }
  }

  // Alimentation principale
  const mainPipeGeometry = new THREE.CylinderGeometry(0.15, 0.15, 70, 8);
  const mainPipeMaterial = new THREE.MeshStandardMaterial({
    color: '#e53e3e',
    metalness: 0.8
  });

  const mainPipe = new THREE.Mesh(mainPipeGeometry, mainPipeMaterial);
  mainPipe.position.set(0, 6.5, 0);
  mainPipe.rotation.z = Math.PI / 2;
  group.add(mainPipe);

  return group;
};

const createSprinkler = (position: [number, number, number]) => {
  const group = new THREE.Group();
  group.position.set(...position);

  const sprinklerGeometry = new THREE.CylinderGeometry(0.1, 0.15, 0.3, 8);
  const sprinklerMaterial = new THREE.MeshStandardMaterial({
    color: '#e53e3e',
    metalness: 0.8
  });

  const sprinkler = new THREE.Mesh(sprinklerGeometry, sprinklerMaterial);
  group.add(sprinkler);

  return group;
};

const createSmokeDetector = (position: [number, number, number]) => {
  const group = new THREE.Group();
  group.position.set(...position);
  group.userData = { type: 'smoke-detector', isInteractive: true };

  const detectorGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.1, 8);
  const detectorMaterial = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    emissive: '#ff0000',
    emissiveIntensity: 0.5
  });

  const detector = new THREE.Mesh(detectorGeometry, detectorMaterial);
  group.add(detector);

  return group;
};

const createFireExtinguisher = (position: [number, number, number]) => {
  const group = new THREE.Group();
  group.position.set(position[0], position[1], position[2]);
  group.userData = { type: 'fire-extinguisher', isInteractive: true };

  const extinguisherGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
  const extinguisherMaterial = new THREE.MeshStandardMaterial({
    color: '#ff0000',
    metalness: 0.7
  });

  const extinguisher = new THREE.Mesh(extinguisherGeometry, extinguisherMaterial);
  group.add(extinguisher);

  return group;
};

export default DataCenterGenerator;
