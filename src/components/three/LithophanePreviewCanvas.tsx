"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stage, Center, useTexture } from "@react-three/drei";
import * as THREE from "three";

function LithophaneModel({ imageSrc, shape }: { imageSrc: string; shape: "plana" | "curva" }) {
  const texture = useTexture(imageSrc);
  const aspect = texture.image ? (texture.image as any).width / (texture.image as any).height : 1;
  const width = 5;
  const height = 5 / aspect;

  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      const baseRotation = shape === "curva" ? Math.PI : 0;
      groupRef.current.rotation.y = baseRotation + Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group>
      <group ref={groupRef}>
        {shape === "plana" && (
          <>
            {/* Front Face (Bumpy, has image) */}
            <mesh castShadow receiveShadow>
              <planeGeometry args={[width, height, 256, 256]} />
              <meshStandardMaterial
                color="#dddddd"
                roughness={0.6}
                metalness={0.1}
                displacementMap={texture}
                displacementScale={-0.3} 
                emissiveMap={texture}
                emissive="#ffffff"
                emissiveIntensity={1.5}
                side={THREE.FrontSide} 
              />
            </mesh>
            {/* Back Face (Flat, white) */}
            <mesh position={[0, 0, -0.31]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[width, height, 1, 1]} />
              <meshStandardMaterial color="#ffffff" roughness={0.4} side={THREE.FrontSide} />
            </mesh>
          </>
        )}

        {shape === "curva" && (
          <>
            {/* Outer Face (Convex, Smooth, White) */}
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[width, width, height, 64, 1, true, -Math.PI / 4, Math.PI / 2]} />
              <meshStandardMaterial
                color="#ffffff"
                roughness={0.4}
                side={THREE.FrontSide} 
              />
            </mesh>
            {/* Inner Face (Concave, Bumpy, has image) */}
            <mesh scale={[-1, 1, 1]}>
              <cylinderGeometry args={[width - 0.31, width - 0.31, height, 256, 256, true, -Math.PI / 4, Math.PI / 2]} />
              <meshStandardMaterial 
                color="#dddddd" 
                roughness={0.6} 
                metalness={0.1}
                displacementMap={texture}
                displacementScale={0.3} // Pushes outward to meet the outer face
                emissiveMap={texture}
                emissive="#ffffff"
                emissiveIntensity={1.5}
                side={THREE.DoubleSide} 
              />
            </mesh>
          </>
        )}
      </group>
      
      {/* Lights outside the rotating group so they stay fixed relative to camera */}
      <pointLight position={[0, 0, -2]} intensity={2} color="#ffffff" distance={10} />
      {shape === "curva" && (
        <pointLight position={[0, 0, 0]} intensity={2} color="#ffffff" distance={10} />
      )}
    </group>
  );
}

interface LithophanePreviewCanvasProps {
  imageSrc: string | null;
  shape: "plana" | "curva";
}

export default function LithophanePreviewCanvas({
  imageSrc,
  shape,
}: LithophanePreviewCanvasProps) {
  if (!imageSrc) return null;

  return (
    <div className="w-full aspect-square rounded-2xl overflow-hidden bg-[#1a1a1e]">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.2} />
        {/* Front light is weak, we want the backlight to do the work */}
        <directionalLight position={[2, 2, 5]} intensity={0.3} />
        
        <React.Suspense fallback={null}>
          <Stage environment="city" intensity={0.1} adjustCamera={1.2}>
            <Center>
              <LithophaneModel imageSrc={imageSrc} shape={shape} />
            </Center>
          </Stage>
        </React.Suspense>
        
        <OrbitControls
          enablePan={false}
          autoRotate
          autoRotateSpeed={1}
        />
      </Canvas>
    </div>
  );
}
