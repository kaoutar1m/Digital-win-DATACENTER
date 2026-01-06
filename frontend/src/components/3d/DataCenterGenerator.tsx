import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

/* ------------------------------------------------------------------ */
/*  DATA-CENTER HAUTE SÉCURITÉ – ZONES CRITIQUES                     */
/*  1. Zone Réception/Accueil (Publique)                             */
/*  2. Zone Technique (Critique) – Racks serveurs                    */
/*  3. Zone de Stockage (Haute densité)                              */
/*  4. Zone Réseau & Communication                                   */
/*  5. Zone de Sécurité & Contrôle                                    */
/*  6. Zone de Maintenance                                           */
/* ------------------------------------------------------------------ */

const DataCenterGenerator: React.FC<{
  onObjectClick?: (event: THREE.Event) => void;
}> = ({ onObjectClick }) => {

  const sceneRef = useRef<THREE.Group>(null);
  const pointLightsRef = useRef<THREE.PointLight[]>([]);

  const zones = [
    { id: 'reception', name: 'ACCUEIL / RÉCEPTION', color: '#3498db', pos: [-35, 0, -25] as [number, number, number], icon: '👥' },
    { id: 'technique', name: 'SALLE TECHNIQUE', color: '#e74c3c', pos: [35, 0, -25] as [number, number, number], icon: '⚙️' },
    { id: 'stockage', name: 'STOCKAGE HAUTE DENSITÉ', color: '#2ecc71', pos: [-35, 0, 25] as [number, number, number], icon: '💾' },
    { id: 'reseau', name: 'CENTRE RÉSEAU', color: '#9b59b6', pos: [35, 0, 25] as [number, number, number], icon: '🌐' },
    { id: 'securite', name: 'SALLE DE CONTRÔLE', color: '#f39c12', pos: [0, 0, -45] as [number, number, number], icon: '🛡️' },
    { id: 'maintenance', name: 'MAINTENANCE', color: '#95a5a6', pos: [0, 0, 45] as [number, number, number], icon: '🔧' }
  ];

  const dataCenter = useMemo(() => {
    const g = new THREE.Group();

    /* 1. BÂTIMENT PRINCIPAL avec architecture moderne */
    g.add(createMainBuilding());

    /* 2. ZONES FONCTIONNELLES */
    zones.forEach(z => g.add(createZone(z)));

    /* 3. SÉCURITÉ PÉRIMÉTRIQUE */
    g.add(createSecurityPerimeter());

    /* 4. INFRASTRUCTURES EXTÉRIEURES */
    g.add(createExternalInfrastructure());

    /* 5. ÉLÉMENTS DE SÉCURITÉ AVANCÉS */
    g.add(createAdvancedSecurity());

    /* 6. VÉHICULES ET ÉQUIPEMENTS */
    g.add(createVehiclesAndEquipment());

    return g;
  }, []);

  /* ANIMATIONS */
  useFrame(({ clock }) => {
    if (!sceneRef.current) return;
    
    // Animation des LED
    sceneRef.current.traverse((child: any) => {
      if (child.userData?.led) {
        const intensity = Math.sin(clock.elapsedTime * 3 + child.userData.phase) * 0.4 + 0.6;
        child.material.emissiveIntensity = intensity;
      }
      if (child.userData?.fan) {
        child.rotation.y += 0.1;
      }
      if (child.userData?.camera) {
        child.rotation.y = Math.sin(clock.elapsedTime * 0.5) * 0.5;
      }
      if (child.userData?.patrol) {
        child.position.x = Math.sin(clock.elapsedTime * 0.3) * 20;
      }
    });

    // Animation des lumières d'urgence
    pointLightsRef.current.forEach((light, index) => {
      if (light.userData?.emergency) {
        light.intensity = Math.sin(clock.elapsedTime * 10 + index) * 2 + 3;
      }
    });
  });

  return (
    <group ref={sceneRef} onClick={onObjectClick}>
      <primitive object={dataCenter} />
      
      {/* Textes 3D pour les zones */}
      <Text
        position={[-35, 14, -25]}
        rotation={[0, 0, 0]}
        fontSize={1.2}
        color={zones[0].color}
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf"
      >
        {zones[0].icon} ACCUEIL
      </Text>
      
      <Text
        position={[35, 14, -25]}
        rotation={[0, 0, 0]}
        fontSize={1.2}
        color={zones[1].color}
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf"
      >
        {zones[1].icon} TECHNIQUE
      </Text>
      
      <Text
        position={[-35, 14, 25]}
        rotation={[0, 0, 0]}
        fontSize={1.2}
        color={zones[2].color}
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf"
      >
        {zones[2].icon} STOCKAGE
      </Text>
      
      <Text
        position={[35, 14, 25]}
        rotation={[0, 0, 0]}
        fontSize={1.2}
        color={zones[3].color}
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf"
      >
        {zones[3].icon} RÉSEAU
      </Text>
      
      <Text
        position={[0, 14, -45]}
        rotation={[0, 0, 0]}
        fontSize={1.2}
        color={zones[4].color}
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf"
      >
        {zones[4].icon} CONTRÔLE
      </Text>
      
      <Text
        position={[0, 14, 45]}
        rotation={[0, 0, 0]}
        fontSize={1.2}
        color={zones[5].color}
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf"
      >
        {zones[5].icon} MAINTENANCE
      </Text>
      
      {/* Titre principal du data center */}
      <Text
        position={[0, 35, 0]}
        rotation={[0, 0, 0]}
        fontSize={2.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf"
        outlineWidth={0.1}
        outlineColor="#000000"
      >
        DATA CENTER HAUTE SÉCURITÉ
      </Text>
      
      <Text
        position={[0, 32, 0]}
        rotation={[0, 0, 0]}
        fontSize={1}
        color="#00ff00"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf"
      >
        🟢 SYSTÈME OPÉRATIONNEL
      </Text>
      
      {/* Éclairage avancé */}
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[100, 200, 100]} 
        intensity={1.2} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <hemisphereLight color="#87ceeb" groundColor="#1a202c" intensity={0.5} />
      
      {/* Lumières de sécurité */}
      {[-60, 0, 60].map(x => 
        [-60, 0, 60].map(z => (
          <pointLight
            key={`${x}-${z}`}
            position={[x, 25, z]}
            color="#ffffff"
            intensity={0.8}
            distance={50}
            decay={2}
          />
        ))
      )}
    </group>
  );
};

/* ------------------------------------------------------------- */
/* 1. BÂTIMENT PRINCIPAL – Architecture haute sécurité           */
/* ------------------------------------------------------------- */
const createMainBuilding = () => {
  const grp = new THREE.Group();

  /* Structure principale en béton armé */
  const structure = new THREE.Mesh(
    new THREE.BoxGeometry(120, 25, 80),
    new THREE.MeshPhysicalMaterial({
      color: '#4a5568',
      roughness: 0.7,
      metalness: 0.3,
      reflectivity: 0.5
    })
  );
  structure.position.y = 12.5;
  structure.castShadow = true;
  structure.receiveShadow = true;
  structure.userData = {
    type: 'building',
    buildingType: 'main_structure',
    buildingId: 'main-building',
    status: 'operational',
    capacity: '10000 sqm'
  };
  grp.add(structure);

  /* Façade vitrée avec renforts */
  for (let i = 0; i < 4; i++) {
    const glassPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(118, 23),
      new THREE.MeshPhysicalMaterial({
        color: '#e6fffa',
        transmission: 0.85,
        thickness: 0.8,
        roughness: 0.05,
        metalness: 0.2,
        ior: 1.52,
        transparent: true,
        opacity: 0.7
      })
    );
    const angle = i * Math.PI / 2;
    glassPanel.position.set(
      Math.cos(angle) * 60,
      12,
      Math.sin(angle) * 40
    );
    glassPanel.rotation.y = angle + Math.PI / 2;
    glassPanel.userData = {
      type: 'building',
      buildingType: 'glass_facade',
      buildingId: `glass-panel-${i}`,
      status: 'operational',
      area: '2714 sqm'
    };
    grp.add(glassPanel);
  }

  /* Toit technique avec équipements */
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(122, 1, 82),
    new THREE.MeshPhysicalMaterial({
      color: '#2d3748',
      metalness: 0.9,
      roughness: 0.2
    })
  );
  roof.position.y = 25.5;
  grp.add(roof);

  /* Unités de climatisation sur le toit avec plus de détails */
  for (let i = 0; i < 8; i++) {
    const acUnit = new THREE.Group();
    
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(4, 0.5, 4),
      new THREE.MeshStandardMaterial({ color: '#2d3748' })
    );
    base.position.y = 0.25;
    
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 1.5, 3.5),
      new THREE.MeshStandardMaterial({ color: '#718096', metalness: 0.7 })
    );
    body.position.y = 1;
    
    const fan = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.5, 0.2, 16),
      new THREE.MeshStandardMaterial({ color: '#1a202c' })
    );
    fan.position.y = 1.9;
    fan.userData = { fan: true };
    
    const grille = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.1, 3),
      new THREE.MeshStandardMaterial({ 
        color: '#cbd5e0',
        transparent: true,
        opacity: 0.6
      })
    );
    grille.position.y = 1.9;
    
    const statusLED = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 16, 16),
      new THREE.MeshStandardMaterial({
        color: '#00ff00',
        emissive: '#00ff00',
        emissiveIntensity: 1
      })
    );
    statusLED.position.set(1.5, 1.5, 1.5);
    statusLED.userData = { led: true, phase: i * 0.5 };
    
    acUnit.add(base, body, fan, grille, statusLED);
    acUnit.position.set(
      (i % 4 - 1.5) * 20,
      27,
      Math.floor(i / 4) * 20 - 10
    );
    acUnit.userData = {
      type: 'equipment',
      equipmentType: 'air_conditioning_unit',
      equipmentId: `ac-unit-${i}`,
      status: 'active',
      coolingCapacity: '100kW'
    };

    grp.add(acUnit);
  }

  /* Entrée principale avec marquage */
  const entrance = new THREE.Mesh(
    new THREE.BoxGeometry(10, 8, 0.5),
    new THREE.MeshStandardMaterial({ color: '#e53e3e' })
  );
  entrance.position.set(0, 4, 40.5);
  grp.add(entrance);

  return grp;
};

/* ------------------------------------------------------------- */
/* 2. ZONE FONCTIONNELLE DÉTAILLÉE                               */
/* ------------------------------------------------------------- */
const createZone = (cfg: { 
  id: string; 
  name: string; 
  color: string; 
  pos: [number, number, number];
  icon: string;
}) => {
  const grp = new THREE.Group();
  grp.position.set(...cfg.pos);

  /* Sol surélevé technique */
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(30, 0.5, 30),
    new THREE.MeshStandardMaterial({
      color: '#2d3748',
      metalness: 0.8,
      roughness: 0.3
    })
  );
  floor.position.y = 0.25;
  floor.receiveShadow = true;
  floor.userData = {
    type: 'infrastructure',
    infrastructureType: 'raised_floor',
    zoneId: cfg.id,
    area: '900 sqm'
  };
  grp.add(floor);

  /* Marquage au sol */
  const marking = new THREE.Mesh(
    new THREE.PlaneGeometry(28, 28),
    new THREE.MeshStandardMaterial({
      color: cfg.color,
      emissive: cfg.color,
      emissiveIntensity: 0.1,
      side: THREE.DoubleSide
    })
  );
  marking.position.y = 0.26;
  marking.rotation.x = -Math.PI / 2;
  marking.userData = {
    type: 'infrastructure',
    infrastructureType: 'floor_marking',
    zoneId: cfg.id,
    zoneName: cfg.name,
    area: '784 sqm'
  };
  grp.add(marking);

  /* Racks serveurs avec détails */
  if (['technique', 'stockage', 'reseau'].includes(cfg.id)) {
    const rackCount = cfg.id === 'stockage' ? 8 : 6;
    const rackHeight = cfg.id === 'stockage' ? 10 : 8;
    
    for (let r = 0; r < rackCount; r++) {
      const row = new THREE.Group();
      row.position.set((r - (rackCount-1)/2) * 4, 0.5, 0);
      
      for (let u = 0; u < 12; u++) {
        const rack = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, rackHeight, 1.5),
          new THREE.MeshPhysicalMaterial({
            color: '#1a202c',
            metalness: 0.9,
            roughness: 0.2
          })
        );
        rack.position.set(0, rackHeight/2, (u - 5.5) * 2.2);
        rack.castShadow = true;
        rack.userData = {
          type: 'rack',
          rackId: `${cfg.id}-rack-${r}-${u}`,
          zone: cfg.id,
          capacity: '42U'
        };
        row.add(rack);

        /* LEDs d'activité */
        for (let led = 0; led < 3; led++) {
          const activityLED = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 12, 12),
            new THREE.MeshStandardMaterial({
              color: cfg.color,
              emissive: cfg.color
            })
          );
          activityLED.position.set(
            0.45,
            rackHeight - 1 - led * 2,
            (u - 5.5) * 2.2
          );
          activityLED.userData = { 
            led: true, 
            phase: Math.random() * Math.PI * 2 
          };
          row.add(activityLED);
        }

        /* Panneau avant avec ports */
        const frontPanel = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, rackHeight, 1.5),
          new THREE.MeshStandardMaterial({ color: '#4a5568' })
        );
        frontPanel.position.set(0.4, rackHeight/2, (u - 5.5) * 2.2);
        row.add(frontPanel);

        /* Ports réseau */
        for (let p = 0; p < 4; p++) {
          const port = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 0.1, 8),
            new THREE.MeshStandardMaterial({ color: '#00ff00' })
          );
          port.position.set(
            0.45,
            rackHeight - 2 - p * 1.5,
            (u - 5.5) * 2.2 + 0.3
          );
          row.add(port);
        }
      }
      grp.add(row);
    }

    /* Système d'extinction incendie amélioré */
    const fireSuppression = new THREE.Group();
    
    const fireBase = new THREE.Mesh(
      new THREE.BoxGeometry(2, 1, 2),
      new THREE.MeshStandardMaterial({ color: '#4a5568' })
    );
    fireBase.position.y = 0.5;
    
    const fireTank = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 8, 16),
      new THREE.MeshStandardMaterial({ color: '#e53e3e', metalness: 0.9 })
    );
    fireTank.position.y = 4.5;
    
    const fireNozzle = new THREE.Mesh(
      new THREE.ConeGeometry(0.15, 0.5, 8),
      new THREE.MeshStandardMaterial({ color: '#cbd5e0' })
    );
    fireNozzle.position.y = 8.5;
    
    const warningLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 16),
      new THREE.MeshStandardMaterial({
        color: '#ff0000',
        emissive: '#ff0000',
        emissiveIntensity: 1
      })
    );
    warningLight.position.set(0, 9, 0);
    warningLight.userData = { led: true, phase: Math.PI };
    
    fireSuppression.add(fireBase, fireTank, fireNozzle, warningLight);
    fireSuppression.position.set(0, 0, 12);
    fireSuppression.userData = {
      type: 'equipment',
      equipmentType: 'fire_suppression',
      equipmentId: `${cfg.id}-fire-suppression`,
      status: 'active',
      capacity: '1000L'
    };
    grp.add(fireSuppression);
    
    /* Système de monitoring environnemental */
    const envMonitor = new THREE.Group();
    
    const monitorBox = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 2, 0.5),
      new THREE.MeshStandardMaterial({ color: '#2d3748' })
    );
    
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 1.5),
      new THREE.MeshStandardMaterial({
        color: '#00ff00',
        emissive: '#00ff00',
        emissiveIntensity: 0.5
      })
    );
    screen.position.set(0, 0, 0.26);
    
    const tempSensor = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 16, 16),
      new THREE.MeshStandardMaterial({ color: '#3498db' })
    );
    tempSensor.position.set(0, 2, 0);
    
    envMonitor.add(monitorBox, screen, tempSensor);
    envMonitor.position.set(12, 5, 0);
    envMonitor.userData = {
      type: 'equipment',
      equipmentType: 'environmental_monitor',
      equipmentId: `${cfg.id}-env-monitor`,
      status: 'active'
    };
    grp.add(envMonitor);
    
    /* Station de maintenance d'urgence */
    const emergencyStation = new THREE.Mesh(
      new THREE.BoxGeometry(1, 2, 0.3),
      new THREE.MeshStandardMaterial({
        color: '#e53e3e',
        emissive: '#e53e3e',
        emissiveIntensity: 0.3
      })
    );
    emergencyStation.position.set(-12, 5, 0);
    
    const emergencyLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 16),
      new THREE.MeshStandardMaterial({
        color: '#ffffff',
        emissive: '#ffffff',
        emissiveIntensity: 1
      })
    );
    emergencyLight.position.set(-12, 6.5, 0.2);
    emergencyLight.userData = { led: true, phase: Math.PI / 2 };
    grp.add(emergencyStation, emergencyLight);
  }

  /* Panneau d'identification 3D avec texte */
  const labelBackground = new THREE.Mesh(
    new THREE.BoxGeometry(10, 2, 0.3),
    new THREE.MeshStandardMaterial({ 
      color: '#1a202c',
      metalness: 0.8,
      emissive: cfg.color,
      emissiveIntensity: 0.2
    })
  );
  labelBackground.position.set(0, 13, 0);
  grp.add(labelBackground);

  /* Barre LED décorative */
  const ledStrip = new THREE.Mesh(
    new THREE.BoxGeometry(9, 0.1, 0.1),
    new THREE.MeshStandardMaterial({
      color: cfg.color,
      emissive: cfg.color,
      emissiveIntensity: 1
    })
  );
  ledStrip.position.set(0, 14.2, 0.2);
  ledStrip.userData = { led: true, phase: 0 };
  grp.add(ledStrip);

  /* Caméras de surveillance dans la zone */
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const camera = new THREE.Group();
    
    const cameraBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.5, 16),
      new THREE.MeshStandardMaterial({ color: '#1a202c' })
    );
    cameraBase.position.set(
      Math.cos(angle) * 13,
      10,
      Math.sin(angle) * 13
    );
    
    const cameraHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 16, 16),
      new THREE.MeshStandardMaterial({ color: '#000000' })
    );
    cameraHead.position.y = 0.4;
    cameraHead.userData = { camera: true };
    
    camera.add(cameraBase, cameraHead);
    grp.add(camera);
  }

  return grp;
};

/* ------------------------------------------------------------- */
/* 3. SÉCURITÉ PÉRIMÉTRIQUE COMPLÈTE                             */
/* ------------------------------------------------------------- */
const createSecurityPerimeter = () => {
  const grp = new THREE.Group();

  /* Clôture haute sécurité */
  const createFenceSection = (length: number) => {
    const section = new THREE.Group();
    const poleCount = Math.floor(length / 4);
    
    for (let i = 0; i <= poleCount; i++) {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 5, 8),
        new THREE.MeshStandardMaterial({ 
          color: '#2d3748',
          metalness: 0.9
        })
      );
      pole.position.set(i * 4 - length/2, 2.5, 0);
      section.add(pole);

      /* Barbelés au sommet */
      const barbedWire = new THREE.Mesh(
        new THREE.TorusGeometry(0.3, 0.05, 8, 16),
        new THREE.MeshStandardMaterial({ color: '#cbd5e0' })
      );
      barbedWire.position.set(i * 4 - length/2, 5, 0);
      barbedWire.rotation.x = Math.PI / 2;
      section.add(barbedWire);

      /* Projecteur sur poteau */
      const spotlight = new THREE.Mesh(
        new THREE.ConeGeometry(0.4, 1, 8),
        new THREE.MeshStandardMaterial({ color: '#f6e05e' })
      );
      spotlight.position.set(i * 4 - length/2, 4.8, 0);
      spotlight.rotation.x = Math.PI / 4;
      spotlight.userData = { spotlight: true };
      section.add(spotlight);
    }

    /* Grillage entre les poteaux */
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(length, 4),
      new THREE.MeshStandardMaterial({
        color: '#718096',
        metalness: 0.8,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
      })
    );
    mesh.position.set(0, 2.5, 0);
    mesh.rotation.y = Math.PI / 2;
    section.add(mesh);

    return section;
  };

  /* Clôture autour du périmètre */
  const perimeterLengths = [200, 150, 200, 150];
  perimeterLengths.forEach((length, index) => {
    const fence = createFenceSection(length);
    const angle = (index * Math.PI) / 2;
    fence.position.set(
      Math.cos(angle) * (index % 2 === 0 ? 100 : 75),
      0,
      Math.sin(angle) * (index % 2 === 0 ? 100 : 75)
    );
    fence.rotation.y = angle + Math.PI / 2;
    grp.add(fence);
  });

  /* Portails d'accès sécurisés */
  const createSecurityGate = (pos: [number, number, number]) => {
    const gate = new THREE.Group();
    gate.position.set(...pos);

    /* Piliers du portail */
    const leftPillar = new THREE.Mesh(
      new THREE.BoxGeometry(1, 6, 1),
      new THREE.MeshStandardMaterial({ color: '#4a5568' })
    );
    leftPillar.position.set(-3, 3, 0);
    
    const rightPillar = leftPillar.clone();
    rightPillar.position.set(3, 3, 0);
    
    /* Barrière coulissante */
    const barrier = new THREE.Mesh(
      new THREE.BoxGeometry(6, 0.3, 0.1),
      new THREE.MeshStandardMaterial({ 
        color: '#e53e3e',
        emissive: '#e53e3e',
        emissiveIntensity: 0.3
      })
    );
    barrier.position.set(0, 1.5, 0);
    barrier.userData = { barrier: true };
    
    /* Lecteur de badge */
    const badgeReader = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.5, 0.1),
      new THREE.MeshStandardMaterial({ color: '#000000' })
    );
    badgeReader.position.set(-2.8, 1, 0.6);
    
    /* Caméra du portail */
    const gateCamera = new THREE.Group();
    const camBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.4, 16),
      new THREE.MeshStandardMaterial({ color: '#1a202c' })
    );
    const camHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 16, 16),
      new THREE.MeshStandardMaterial({ color: '#000000' })
    );
    camHead.position.y = 0.3;
    camHead.userData = { camera: true };
    gateCamera.add(camBase, camHead);
    gateCamera.position.set(2.8, 3, 0.6);
    
    gate.add(leftPillar, rightPillar, barrier, badgeReader, gateCamera);
    return gate;
  };

  /* Portails aux entrées */
  const gates = [
    [0, 0, 75] as [number, number, number],
    [0, 0, -75] as [number, number, number],
    [100, 0, 0] as [number, number, number],
    [-100, 0, 0] as [number, number, number]
  ];
  gates.forEach(pos => grp.add(createSecurityGate(pos)));

  return grp;
};

/* ------------------------------------------------------------- */
/* 4. INFRASTRUCTURES EXTÉRIEURES                                */
/* ------------------------------------------------------------- */
const createExternalInfrastructure = () => {
  const grp = new THREE.Group();

  /* Groupes électrogènes */
  for (let i = 0; i < 4; i++) {
    const generator = new THREE.Group();
    
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(6, 1, 3),
      new THREE.MeshStandardMaterial({ color: '#1a202c' })
    );
    base.position.y = 0.5;
    
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(5, 2, 2),
      new THREE.MeshStandardMaterial({ color: '#4a5568' })
    );
    body.position.y = 2;
    
    const exhaust = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 1, 16),
      new THREE.MeshStandardMaterial({ color: '#718096' })
    );
    exhaust.position.set(0, 3.5, 0);
    
    const controlPanel = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1.5, 0.2),
      new THREE.MeshStandardMaterial({ color: '#000000' })
    );
    controlPanel.position.set(2, 1.5, 1);
    
    generator.add(base, body, exhaust, controlPanel);
    generator.position.set(
      i < 2 ? -60 : 60,
      0,
      i % 2 === 0 ? -40 : 40
    );

    generator.userData = {
      type: 'equipment',
      equipmentType: 'backup_generator',
      equipmentId: `generator-${i}`,
      status: 'active',
      powerOutput: '500kW'
    };

    grp.add(generator);
  }

  /* Unités de refroidissement */
  for (let i = 0; i < 6; i++) {
    const coolingUnit = new THREE.Group();
    
    const housing = new THREE.Mesh(
      new THREE.BoxGeometry(4, 3, 4),
      new THREE.MeshStandardMaterial({ color: '#a0aec0' })
    );
    housing.position.y = 1.5;
    
    const fan = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.5, 0.3, 16),
      new THREE.MeshStandardMaterial({ color: '#2d3748' })
    );
    fan.position.y = 3;
    fan.userData = { fan: true };
    
    coolingUnit.add(housing, fan);
    coolingUnit.position.set(
      (i % 3 - 1) * 15,
      0,
      Math.floor(i / 3) * 30 - 15
    );

    coolingUnit.userData = {
      type: 'equipment',
      equipmentType: 'cooling_unit',
      equipmentId: `cooling-unit-${i}`,
      status: 'active',
      coolingCapacity: '50kW'
    };

    grp.add(coolingUnit);
  }

  /* Réservoirs d'eau */
  const createWaterTank = (pos: [number, number, number]) => {
    const tank = new THREE.Group();
    
    const tankBody = new THREE.Mesh(
      new THREE.CylinderGeometry(3, 3, 6, 16),
      new THREE.MeshStandardMaterial({ 
        color: '#3182ce',
        metalness: 0.9,
        roughness: 0.1
      })
    );
    tankBody.position.y = 3;
    
    const legs = [];
    for (let j = 0; j < 4; j++) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 3, 8),
        new THREE.MeshStandardMaterial({ color: '#4a5568' })
      );
      leg.position.set(
        Math.cos(j * Math.PI / 2) * 2.5,
        1.5,
        Math.sin(j * Math.PI / 2) * 2.5
      );
      legs.push(leg);
    }
    
    tank.add(tankBody, ...legs);
    tank.position.set(...pos);

    tank.userData = {
      type: 'equipment',
      equipmentType: 'water_tank',
      equipmentId: `water-tank-${pos[0] > 0 ? 'east' : 'west'}`,
      status: 'active',
      capacity: '50000L'
    };

    return tank;
  };

  grp.add(createWaterTank([-80, 0, 0]));
  grp.add(createWaterTank([80, 0, 0]));

  return grp;
};

/* ------------------------------------------------------------- */
/* 5. SÉCURITÉ AVANCÉE                                           */
/* ------------------------------------------------------------- */
const createAdvancedSecurity = () => {
  const grp = new THREE.Group();

  /* Tours de guet */
  const createWatchTower = (pos: [number, number, number]) => {
    const tower = new THREE.Group();
    
    const foundation = new THREE.Mesh(
      new THREE.CylinderGeometry(4, 5, 1, 8),
      new THREE.MeshStandardMaterial({ color: '#2d3748' })
    );
    foundation.position.y = 0.5;
    
    const towerBody = new THREE.Mesh(
      new THREE.CylinderGeometry(3, 4, 15, 8),
      new THREE.MeshStandardMaterial({ color: '#4a5568' })
    );
    towerBody.position.y = 8;
    
    const observation = new THREE.Mesh(
      new THREE.BoxGeometry(5, 3, 5),
      new THREE.MeshPhysicalMaterial({
        color: '#e6fffa',
        transmission: 0.8,
        thickness: 0.5,
        transparent: true,
        opacity: 0.9
      })
    );
    observation.position.y = 16;
    
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(3, 2, 8),
      new THREE.MeshStandardMaterial({ color: '#2d3748' })
    );
    roof.position.y = 18.5;
    
    /* Gyrophare */
    const beacon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 0.8, 16),
      new THREE.MeshStandardMaterial({
        color: '#f59e0b',
        emissive: '#f59e0b',
        emissiveIntensity: 1
      })
    );
    beacon.position.y = 19.5;
    beacon.userData = { led: true, emergency: true };
    
    /* Projecteurs */
    for (let i = 0; i < 4; i++) {
      const spotlight = new THREE.Mesh(
        new THREE.ConeGeometry(0.5, 1.5, 8),
        new THREE.MeshStandardMaterial({ color: '#f6e05e' })
      );
      spotlight.position.set(
        Math.cos(i * Math.PI / 2) * 2.5,
        17,
        Math.sin(i * Math.PI / 2) * 2.5
      );
      spotlight.lookAt(
        Math.cos(i * Math.PI / 2) * 50,
        0,
        Math.sin(i * Math.PI / 2) * 50
      );
      tower.add(spotlight);
    }
    
    tower.add(foundation, towerBody, observation, roof, beacon);
    tower.position.set(...pos);
    return tower;
  };

  const towerPositions: [number, number, number][] = [
    [-90, 0, -90], [90, 0, -90], [-90, 0, 90], [90, 0, 90]
  ];
  towerPositions.forEach(pos => grp.add(createWatchTower(pos)));

  /* Borne anti-intrusion */
  const createBollard = (pos: [number, number, number]) => {
    const bollard = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 1.5, 16),
      new THREE.MeshStandardMaterial({
        color: '#e53e3e',
        metalness: 0.9
      })
    );
    bollard.position.set(...pos);
    
    const topLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 16),
      new THREE.MeshStandardMaterial({
        color: '#ffffff',
        emissive: '#ffffff',
        emissiveIntensity: 0.5
      })
    );
    topLight.position.y = 0.9;
    bollard.add(topLight);
    
    return bollard;
  };

  /* Ligne de bornes */
  for (let i = -8; i <= 8; i++) {
    if (i === 0) continue;
    grp.add(createBollard([i * 2, 0, 78]));
    grp.add(createBollard([i * 2, 0, -78]));
  }

  /* Système de reconnaissance de plaques */
  const createLicensePlateReader = (pos: [number, number, number]) => {
    const reader = new THREE.Group();
    
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 3, 8),
      new THREE.MeshStandardMaterial({ color: '#2d3748' })
    );
    pole.position.y = 1.5;
    
    const camera = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.3, 0.2),
      new THREE.MeshStandardMaterial({ color: '#000000' })
    );
    camera.position.set(0, 3, 0.2);
    camera.userData = { camera: true };
    
    const irLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 8, 8),
      new THREE.MeshStandardMaterial({
        color: '#0000ff',
        emissive: '#0000ff'
      })
    );
    irLight.position.set(0, 3, -0.2);
    
    reader.add(pole, camera, irLight);
    reader.position.set(...pos);
    return reader;
  };

  grp.add(createLicensePlateReader([0, 0, 72]));
  grp.add(createLicensePlateReader([0, 0, -72]));

  return grp;
};

/* ------------------------------------------------------------- */
/* 6. VÉHICULES ET ÉQUIPEMENTS                                  */
/* ------------------------------------------------------------- */
const createVehiclesAndEquipment = () => {
  const grp = new THREE.Group();

  /* Véhicule de patrouille */
  const patrolCar = new THREE.Group();
  
  const chassis = new THREE.Mesh(
    new THREE.BoxGeometry(4, 1.2, 2),
    new THREE.MeshStandardMaterial({ color: '#1a202c' })
  );
  chassis.position.y = 0.6;
  
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(3, 1.2, 1.8),
    new THREE.MeshStandardMaterial({ color: '#2d3748' })
  );
  cabin.position.set(0, 1.2, 0);
  
  const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
  const wheelMaterial = new THREE.MeshStandardMaterial({ color: '#000000' });
  
  const wheelPositions = [
    [-1.2, 0.4, 0.9] as [number, number, number], [1.2, 0.4, 0.9],
    [-1.2, 0.4, -0.9] as [number, number, number], [1.2, 0.4, -0.9]
  ] as [number, number, number][];

  wheelPositions.forEach(pos => {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.position.set(...pos);
    wheel.rotation.z = Math.PI / 2;
    patrolCar.add(wheel);
  });
  
  const lightbar = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.3, 0.5),
    new THREE.MeshStandardMaterial({
      color: '#0000ff',
      emissive: '#0000ff',
      emissiveIntensity: 0.8
    })
  );
  lightbar.position.set(0, 2, 0);
  lightbar.userData = { led: true, phase: 0 };
  
  patrolCar.add(chassis, cabin, lightbar);
  patrolCar.position.set(0, 0, 60);
  patrolCar.userData = {
    type: 'equipment',
    equipmentType: 'security_vehicle',
    equipmentId: 'patrol-car-1',
    status: 'active',
    patrol: true
  };

  grp.add(patrolCar);

  /* Camion de livraison */
  const deliveryTruck = new THREE.Group();
  
  const truckChassis = new THREE.Mesh(
    new THREE.BoxGeometry(6, 1.5, 2.5),
    new THREE.MeshStandardMaterial({ color: '#e53e3c' })
  );
  truckChassis.position.y = 0.75;
  
  const truckCabin = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 2, 2.5),
    new THREE.MeshStandardMaterial({ color: '#2d3748' })
  );
  truckCabin.position.set(-1.5, 1.75, 0);
  
  const container = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2.5, 2.5),
    new THREE.MeshStandardMaterial({ color: '#cbd5e0' })
  );
  container.position.set(1.5, 1.5, 0);
  
  const truckWheelPositions = [
    [-2, 0.4, 1.1] as [number, number, number], [0.8, 0.4, 1.1], [3, 0.4, 1.1],
    [-2, 0.4, -1.1] as [number, number, number], [0.8, 0.4, -1.1], [3, 0.4, -1.1]
  ] as [number, number, number][];

  truckWheelPositions.forEach(pos => {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.position.set(...pos);
    wheel.rotation.z = Math.PI / 2;
    deliveryTruck.add(wheel);
  });
  
  deliveryTruck.add(truckChassis, truckCabin, container);
  deliveryTruck.position.set(-40, 0, 65);

  deliveryTruck.userData = {
    type: 'equipment',
    equipmentType: 'delivery_vehicle',
    equipmentId: 'delivery-truck-1',
    status: 'active',
    loadCapacity: '10 tons'
  };

  grp.add(deliveryTruck);

  /* Chariot élévateur */
  const forklift = new THREE.Group();
  
  const forkliftBase = new THREE.Mesh(
    new THREE.BoxGeometry(2, 1, 1.2),
    new THREE.MeshStandardMaterial({ color: '#f59e0b' })
  );
  forkliftBase.position.y = 0.5;
  
  const mast = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 3, 0.3),
    new THREE.MeshStandardMaterial({ color: '#4a5568' })
  );
  mast.position.set(0, 2, 0.4);
  
  const forks = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.1, 1),
    new THREE.MeshStandardMaterial({ color: '#718096' })
  );
  forks.position.set(0, 0.5, 0.8);
  
  const forkliftWheelPositions = [
    [-0.6, 0.2, 0.4] as [number, number, number], [0.6, 0.2, 0.4],
    [-0.6, 0.2, -0.4] as [number, number, number], [0.6, 0.2, -0.4]
  ] as [number, number, number][];

  forkliftWheelPositions.forEach(pos => {
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 0.2, 16),
      wheelMaterial
    );
    wheel.position.set(...pos);
    wheel.rotation.z = Math.PI / 2;
    forklift.add(wheel);
  });
  
  forklift.add(forkliftBase, mast, forks);
  forklift.position.set(30, 0, 65);

  forklift.userData = {
    type: 'equipment',
    equipmentType: 'forklift',
    equipmentId: 'forklift-1',
    status: 'active',
    liftCapacity: '5 tons'
  };

  grp.add(forklift);

  return grp;
};

export default DataCenterGenerator;