import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { CameraControls as CameraControlsImpl } from '@react-three/drei';
import type { CameraControls as CameraControlsType } from '@react-three/drei';

const cameraPresets = {
  overview: { position: [0, 50, 80], target: [0, 0, 0] },
  entrance: { position: [0, 5, 60], target: [0, 5, 0] },
  rackRow1: { position: [-20, 3, 0], target: [-20, 3, -10] },
  criticalZone: { position: [30, 4, 20], target: [30, 4, 0] },
  securityRoom: { position: [40, 3, -30], target: [0, 3, -30] }
};

const CameraControls = ({ preset, onArrive, isPanoramaMode = false }: any) => {
  const controls = useRef<CameraControlsType>(null);
  const { camera } = useThree();
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (preset && controls.current && !isPanoramaMode) {
      const { position, target } = cameraPresets[preset];
      controls.current.setPosition(position[0], position[1], position[2], true);
      controls.current.setTarget(target[0], target[1], target[2], true);
      onArrive?.();
    }
  }, [preset, isPanoramaMode]);

  useFrame((state) => {
    if (isPanoramaMode) {
      setRotation(prev => prev + 0.002);
      state.camera.position.x = Math.cos(rotation) * 40;
      state.camera.position.z = Math.sin(rotation) * 40;
      state.camera.lookAt(0, 5, 0);
    }
  });

  if (isPanoramaMode) {
    return null; // Panorama mode doesn't use controls
  }

  return <CameraControlsImpl ref={controls} />;
};

export default CameraControls;
