"use client";

import { useRef, useEffect, Suspense } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Center, Environment } from "@react-three/drei";

function STLMesh({ geometry }: { geometry: THREE.BufferGeometry }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const { camera } = useThree();

  useEffect(() => {
    if (meshRef.current && geometry) {
      geometry.computeBoundingBox();
      const box = geometry.boundingBox!;
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 3 / maxDim;
      meshRef.current.scale.setScalar(scale);
    }
  }, [geometry]);

  return (
    <group>
      <mesh ref={meshRef} geometry={geometry} dispose={null} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#06b6d4"
          metalness={0.3}
          roughness={0.4}
          envMapIntensity={0.8}
          clearcoat={0.3}
          clearcoatRoughness={0.2}
        />
      </mesh>
    </group>
  );
}

interface STLViewerProps {
  geometry: THREE.BufferGeometry;
}

export default function STLViewer({ geometry }: STLViewerProps) {
  return (
    <div id="stl-viewer-canvas" className="w-full aspect-square sm:aspect-video rounded-xl overflow-hidden glass canvas-container">
      <Canvas
        camera={{ position: [3, 2, 4], fov: 50 }}
        dpr={[1, 2]}
        shadows
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        style={{ background: "rgba(0,0,0,0.2)" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          color="#ffffff"
          castShadow
        />
        <directionalLight
          position={[-3, 2, -2]}
          intensity={0.4}
          color="#8b5cf6"
        />
        <pointLight position={[0, -3, 0]} intensity={0.3} color="#06b6d4" />

        <Suspense fallback={null}>
          <Environment preset="studio" />
          <STLMesh geometry={geometry} />
        </Suspense>

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate
          autoRotateSpeed={2}
          minDistance={1}
          maxDistance={15}
        />

        {/* Ground grid */}
        <gridHelper args={[10, 20, "#444444", "#222222"]} position={[0, -1.5, 0]} />
      </Canvas>
    </div>
  );
}
