"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

function FloatingShape({
  position,
  color,
  speed,
  shape,
}: {
  position: [number, number, number];
  color: string;
  speed: number;
  shape: "box" | "torus" | "octahedron" | "icosahedron" | "cone";
}) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.2;
    }
  });

  const geometry = useMemo(() => {
    switch (shape) {
      case "box":
        return <boxGeometry args={[1, 1, 1]} />;
      case "torus":
        return <torusGeometry args={[0.7, 0.25, 16, 32]} />;
      case "octahedron":
        return <octahedronGeometry args={[0.7]} />;
      case "icosahedron":
        return <icosahedronGeometry args={[0.6, 0]} />;
      case "cone":
        return <coneGeometry args={[0.5, 1, 6]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  }, [shape]);

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={1.5}>
      <mesh ref={meshRef} position={position}>
        {geometry}
        <meshStandardMaterial
          color={color}
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>
    </Float>
  );
}

function Particles() {
  const particlesRef = useRef<THREE.Points>(null!);
  const count = 200;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#06b6d4"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 canvas-container">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} color="#06b6d4" />
        <directionalLight position={[-5, -5, 5]} intensity={0.3} color="#8b5cf6" />

        <Particles />

        <FloatingShape position={[-3, 2, -2]} color="#06b6d4" speed={1.2} shape="torus" />
        <FloatingShape position={[3.5, -1.5, -3]} color="#8b5cf6" speed={0.8} shape="octahedron" />
        <FloatingShape position={[-2, -2, -1]} color="#ec4899" speed={1.5} shape="icosahedron" />
        <FloatingShape position={[2, 2.5, -4]} color="#22d3ee" speed={1} shape="box" />
        <FloatingShape position={[4, 0, -2]} color="#a78bfa" speed={0.6} shape="cone" />
      </Canvas>
    </div>
  );
}
