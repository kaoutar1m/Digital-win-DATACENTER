import React, { useRef, useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import * as THREE from 'three';

const BuildingOptimizer: React.FC = () => {
  const buildingRef = useRef<THREE.Group>(null);

  // Charger le modèle OBJ
  const obj = useLoader(OBJLoader, '/models/building/base.obj');

  // Créer des matériaux personnalisés pour remplacer ceux manquants
  useEffect(() => {
    if (!obj || !buildingRef.current) return;

    const customMaterials = {
      concrete: new THREE.MeshStandardMaterial({
        color: '#2d3748',
        roughness: 0.8,
        metalness: 0.2,
        name: 'concrete'
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: '#1e293b',
        transmission: 0.7,
        thickness: 2.5,
        roughness: 0.1,
        metalness: 0.9,
        ior: 2.5,
        name: 'glass'
      }),
      metal: new THREE.MeshStandardMaterial({
        color: '#4a5568',
        metalness: 0.9,
        roughness: 0.3,
        name: 'metal'
      })
    };

    // Traverser la scène et appliquer les matériaux appropriés
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Configuration des ombres
        child.castShadow = true;
        child.receiveShadow = true;

        // Identifier le type de matériau par nom ou propriétés
        const childName = child.name.toLowerCase();

        if (childName.includes('glass') || childName.includes('vitre') || childName.includes('window')) {
          child.material = customMaterials.glass;
        } else if (childName.includes('metal') || childName.includes('acier') || childName.includes('frame')) {
          child.material = customMaterials.metal;
        } else if (childName.includes('concrete') || childName.includes('beton') || childName.includes('wall')) {
          child.material = customMaterials.concrete;
        }

        // Forcer la mise à jour
        child.material.needsUpdate = true;
      }
    });

    // Organiser la scène en groupes logiques
    const structureGroup = new THREE.Group();
    const facadeGroup = new THREE.Group();
    const detailsGroup = new THREE.Group();

    obj.traverse((child) => {
      const name = child.name.toLowerCase();

      if (name.includes('structure') || name.includes('pillar') || name.includes('column')) {
        structureGroup.add(child.clone());
      } else if (name.includes('facade') || name.includes('exterior') || name.includes('wall')) {
        facadeGroup.add(child.clone());
      } else if (name.includes('detail') || name.includes('vent') || name.includes('cooling')) {
        detailsGroup.add(child.clone());
      }
    });

    buildingRef.current.add(structureGroup, facadeGroup, detailsGroup);

  }, [obj]);

  return (
    <group ref={buildingRef}>
      {/* Le modèle OBJ chargé automatiquement avec nos optimisations */}
      {obj && <primitive object={obj} />}

      {/* Ajouter les éléments manquants programmatiquement */}
      <AdditionalBuildingElements />
    </group>
  );
};

// Composant pour ajouter les éléments manquants
const AdditionalBuildingElements: React.FC = () => {
  return (
    <group>
      {/* Unités de refroidissement sur le toit (si manquantes) */}
      {[...Array(8)].map((_, i) => (
        <mesh key={`cooling-${i}`} position={[-35 + i * 10, 18, -35]} castShadow receiveShadow>
          <boxGeometry args={[8, 3, 8]} />
          <meshStandardMaterial
            color="#4a5568"
            metalness={0.8}
            roughness={0.4}
          />
        </mesh>
      ))}

      {/* Caméras de sécurité externes */}
      {[
        { pos: [-45, 12, -38] as [number, number, number], rot: [0, Math.PI / 4, 0] as [number, number, number] },
        { pos: [45, 12, -38] as [number, number, number], rot: [0, -Math.PI / 4, 0] as [number, number, number] },
        { pos: [-45, 12, 38] as [number, number, number], rot: [0, Math.PI * 3/4, 0] as [number, number, number] },
        { pos: [45, 12, 38] as [number, number, number], rot: [0, -Math.PI * 3/4, 0] as [number, number, number] }
      ].map((cam, i) => (
        <SecurityCamera
          key={`ext-camera-${i}`}
          position={cam.pos}
          rotation={cam.rot}
        />
      ))}

      {/* Portes sécurisées */}
      <mesh position={[0, 3, 38]} castShadow receiveShadow>
        <boxGeometry args={[5, 6, 0.5]} />
        <meshStandardMaterial
          color="#1a365d"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
};

const SecurityCamera: React.FC<{ position: [number, number, number]; rotation: [number, number, number] }> = ({ position, rotation }) => (
  <group position={position} rotation={rotation}>
    <mesh castShadow receiveShadow>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshPhysicalMaterial
        color="#2d3748"
        transmission={0.9}
        thickness={0.2}
        roughness={0.1}
      />
    </mesh>
    <mesh position={[0, 0, 0.4]} castShadow receiveShadow>
      <cylinderGeometry args={[0.1, 0.15, 0.3]} />
      <meshStandardMaterial color="#1a202c" metalness={0.9} />
    </mesh>
  </group>
);

export default BuildingOptimizer;
