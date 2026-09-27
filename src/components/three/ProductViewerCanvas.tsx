"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Stage, Center } from "@react-three/drei";
import * as THREE from "three";

function ModelViewer({ modelPath }: { modelPath: string }) {
  const { scene } = useGLTF(modelPath);
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene.clone()} />
    </group>
  );
}

interface ProductViewerCanvasProps {
  modelPath: string;
}

export default function ProductViewerCanvas({ modelPath }: ProductViewerCanvasProps) {
  return (
    <div className="w-full aspect-square rounded-2xl overflow-hidden bg-[#1a1a1e]">
      <Canvas
        camera={{ position: [0, 1, 3], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-3, -2, 4]} intensity={0.3} color="#0A84FF" />
        <React.Suspense fallback={null}>
          <Stage environment="city" intensity={0.3} adjustCamera={1.5}>
            <Center>
              <ModelViewer modelPath={modelPath} />
            </Center>
          </Stage>
        </React.Suspense>
        <OrbitControls
          enablePan={false}
          autoRotate
          autoRotateSpeed={1.5}
        />
      </Canvas>
    </div>
  );
}
