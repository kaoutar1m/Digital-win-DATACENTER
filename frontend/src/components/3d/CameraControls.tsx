// components/CameraControls/CameraControls.tsx
import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { CameraControls as CameraControlsDrei } from '@react-three/drei';
import type { CameraControls as CameraControlsType } from '@react-three/drei';

export interface CameraControlsRef {
  flyTo: (name: keyof typeof presets) => void;
  startPanorama: () => void;
  stopPanorama: () => void;
}

const presets = {
  overview:    { pos: [0, 35, 80] as [number, number, number],    target: [0, 8, 0] as [number, number, number] },
  entrance:    { pos: [0, 6, 50] as [number, number, number],    target: [0, 5, 0] as [number, number, number] },
  processing:  { pos: [-25, 8, -15] as [number, number, number], target: [-25, 4, -15] as [number, number, number] },
  storage:     { pos: [25, 8, -15] as [number, number, number],  target: [25, 4, -15] as [number, number, number] },
  distribution:{ pos: [-25, 8, 15] as [number, number, number], target: [-25, 4, 15] as [number, number, number] },
  security:    { pos: [25, 8, 15] as [number, number, number],   target: [25, 4, 15] as [number, number, number] },
  roof:        { pos: [0, 45, 0] as [number, number, number],    target: [0, 15, 0] as [number, number, number] },
} as const;


const CameraControls = forwardRef<CameraControlsRef, {}>((_, ref) => {
  const controls = useRef<CameraControlsType>(null!);
  const { camera, gl } = useThree();
  const [autoRotate, setAutoRotate] = React.useState(true);
  const angle = useRef(0);

  /* expose commands au parent */
  useImperativeHandle(ref, () => ({
    flyTo: (name) => {
      const { pos, target } = presets[name];
      controls.current.setLookAt(...pos, ...target, true);
      setAutoRotate(false);
    },
    startPanorama: () => setAutoRotate(true),
    stopPanorama: () => setAutoRotate(false),
  }));

  /* panoramique automatique jusqu’à interaction */
  useFrame((state, delta) => {
    if (autoRotate) {
      angle.current += delta * 0.1;
      const x = Math.cos(angle.current) * 60;
      const z = Math.sin(angle.current) * 60;
      camera.position.lerp(new THREE.Vector3(x, 25, z), 0.02);
      camera.lookAt(0, 5, 0);
    }
  });

  /* stop auto-rotate dès que l’utilisateur interagit */
  useEffect(() => {
    const onInteraction = () => setAutoRotate(false);
    const domElement = gl.domElement;
    domElement.addEventListener('pointerdown', onInteraction);
    domElement.addEventListener('wheel', onInteraction);
    return () => {
      domElement.removeEventListener('pointerdown', onInteraction);
      domElement.removeEventListener('wheel', onInteraction);
    };
  }, [gl]);

  return (
    <CameraControlsDrei
      ref={controls}
      minDistance={5}
      maxDistance={150}
      smoothTime={0.3}
      azimuthRotateSpeed={-0.3}
      polarRotateSpeed={-0.3}
      dollySpeed={1.5}
      truckSpeed={2}
    />
  );
});

CameraControls.displayName = 'CameraControls';
export default CameraControls;