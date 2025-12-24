import React, { useEffect, useRef, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface BackupGeneratorProps {
  position?: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
  isActive?: boolean;
}

const MODEL_URL = "/models/interior/infrastructure/backup-generator.glb";

/**
 * Wrapper SAFE: vérifie que le GLB est accessible (et non vide) avant de rendre le loader.
 * Comme useGLTF throw en cas d'échec, on évite de l'appeler tant que le fichier n'est pas OK.
 */
const BackupGenerator: React.FC<BackupGeneratorProps> = (props) => {
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // HEAD pour savoir si le fichier existe
        const head = await fetch(MODEL_URL, { method: "HEAD" });
        if (cancelled) return;

        if (!head.ok) {
          setAvailable(false);
          return;
        }

        // Certains serveurs renvoient Content-Length, d'autres non.
        // Si Content-Length existe et vaut 0 => fichier vide => invalide.
        const len = head.headers.get("content-length");
        if (len !== null && Number(len) === 0) {
          setAvailable(false);
          return;
        }

        setAvailable(true);
      } catch {
        if (!cancelled) setAvailable(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Pendant le check => on peut afficher un placeholder léger
  if (available === null) {
    return <BackupGeneratorPlaceholder {...props} label="Chargement..." />;
  }

  // Si fichier absent / vide => placeholder
  if (available === false) {
    return <BackupGeneratorPlaceholder {...props} label="Modèle manquant" />;
  }

  // OK => on peut charger le modèle
  return <BackupGeneratorModel {...props} />;
};

const BackupGeneratorModel: React.FC<BackupGeneratorProps> = ({
  position = [0, 0, 0],
  scale = [1, 1, 1],
  rotation = [0, 0, 0],
  isActive = false
}) => {
  const meshRef = useRef<THREE.Group>(null);

  // Charger le modèle GLB (ici seulement si disponible === true)
  const { scene } = useGLTF(MODEL_URL) as any;

  // Animation pour simuler le fonctionnement
  useFrame((state) => {
    if (meshRef.current && isActive) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 10) * 0.01;
    }
  });

  return (
    <group ref={meshRef} position={position} scale={scale} rotation={rotation}>
      <primitive object={scene} />

      {isActive && (
        <>
          <pointLight position={[0, 2, 0]} intensity={2} color="#00ff00" distance={5} />
          <mesh position={[0, 1.5, -1]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color="#ff4500" transparent opacity={0.6} />
          </mesh>
        </>
      )}

      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.2]} />
        <meshStandardMaterial
          color={isActive ? "#00ff00" : "#ff0000"}
          emissive={isActive ? "#004400" : "#440000"}
        />
      </mesh>
    </group>
  );
};

const BackupGeneratorPlaceholder: React.FC<BackupGeneratorProps & { label?: string }> = ({
  position = [0, 0, 0],
  scale = [1, 1, 1],
  rotation = [0, 0, 0],
  isActive = false,
  label
}) => {
  // Placeholder simple (un bloc) pour ne pas planter l'app
  return (
    <group position={position} scale={scale} rotation={rotation}>
      <mesh>
        <boxGeometry args={[3, 2, 2]} />
        <meshStandardMaterial color={isActive ? "#22c55e" : "#ef4444"} transparent opacity={0.7} />
      </mesh>

      {/* petit voyant */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color={isActive ? "#00ff00" : "#ff0000"}
          emissive={isActive ? "#004400" : "#440000"}
        />
      </mesh>

      {/* label optionnel (juste en userData si tu veux l'utiliser ailleurs) */}
      {label ? <group userData={{ label }} /> : null}
    </group>
  );
};

// IMPORTANT: on ne preload pas tant que le fichier n'est pas fiable
// useGLTF.preload(MODEL_URL);

export default BackupGenerator;
