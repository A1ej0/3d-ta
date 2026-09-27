"use client";

import React, { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, OrbitControls, Text3D } from "@react-three/drei";
import * as THREE from "three";

const FONT_URL = "/fonts/helvetiker_bold.typeface.json";

interface Text3DModelProps {
  text: string;
  type: "llavero" | "decorativa";
  baseColor: string;
  textColor: string;
}

function Text3DModel({ text, type, baseColor, textColor }: Text3DModelProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const displayText = text || "3D-Ta";
  const isKeychain = type === "llavero";

  const baseDepth = isKeychain ? 0.07 : 0.09;
  const textDepth = isKeychain ? 0.08 : 0.25;

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
    }
  });

  const textMeshRef = useRef<THREE.Mesh>(null!);

  return (
    <group ref={groupRef}>
      <Center>
        <group>
          {/*
            LAYER 1: BASE — Same text shape with a HUGE bevelSize.
            The oversized bevel merges adjacent letters into one continuous
            outline, exactly like the reference keychain image.
          */}
          <Text3D
            ref={textMeshRef}
            font={FONT_URL}
            size={0.5}
            height={baseDepth}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0}
            bevelSize={0.11}
            bevelSegments={10}
          >
            {displayText}
            <meshStandardMaterial color={baseColor} roughness={0.4} metalness={0.1} />
          </Text3D>

          {/*
            LAYER 2: TEXT — Same text, normal bevel, extruded ON TOP of base.
            Positioned forward in Z so it sits on the base surface.
          */}
          <group position={[0, 0, baseDepth]}>
            <Text3D
              font={FONT_URL}
              size={0.5}
              height={textDepth}
              curveSegments={12}
              bevelEnabled
              bevelThickness={0.015}
              bevelSize={0.02}
              bevelSegments={3}
            >
              {displayText}
              <meshStandardMaterial color={textColor} roughness={0.25} metalness={0.2} />
            </Text3D>
          </group>

          {/* KEYCHAIN HOLE — Disc with hole, part of the base layer */}
          {isKeychain && (
            <KeychainTab
              displayText={displayText}
              baseDepth={baseDepth}
              baseColor={baseColor}
              textMeshRef={textMeshRef}
            />
          )}
        </group>
      </Center>
    </group>
  );
}

function KeychainTab({
  displayText,
  baseDepth,
  baseColor,
  textMeshRef,
}: {
  displayText: string;
  baseDepth: number;
  baseColor: string;
  textMeshRef: React.RefObject<THREE.Mesh>;
}) {
  const tabGroupRef = useRef<THREE.Group>(null!);
  const tabRadius = 0.14;
  const holeRadius = 0.08;

  // Ring shape (disc with hole punched through)
  const ringShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, tabRadius, 0, Math.PI * 2, false);
    const holePath = new THREE.Path();
    holePath.absarc(0, 0, holeRadius, 0, Math.PI * 2, true);
    shape.holes.push(holePath);
    return shape;
  }, []);

  const extrudeSettings = useMemo(
    () => ({
      depth: baseDepth,
      bevelEnabled: true,
      bevelThickness: 0,
      bevelSize: 0.01,
      bevelSegments: 4,
    }),
    [baseDepth]
  );

  // Lock position every frame so it never gets out of sync when Center shifts the group
  useFrame(() => {
    if (tabGroupRef.current && textMeshRef.current?.geometry) {
      if (!textMeshRef.current.geometry.boundingBox) {
        textMeshRef.current.geometry.computeBoundingBox();
      }
      const bbox = textMeshRef.current.geometry.boundingBox;
      if (bbox) {
        // Place at bottom-left corner of the base mesh (which already includes the bevel)
        // Offset X slightly (-0.05) so the ring overlaps the base for a solid connection
        tabGroupRef.current.position.set(bbox.min.x - 0.05, bbox.min.y + tabRadius, 0);
      }
    }
  });

  return (
    <>
      {/* Tab with hole — extruded along Z (same axis as base) */}
      <group ref={tabGroupRef}>
        <mesh>
          <extrudeGeometry args={[ringShape, extrudeSettings]} />
          <meshStandardMaterial color={baseColor} roughness={0.4} metalness={0.1} />
        </mesh>
      </group>
    </>
  );
}

interface TextPreviewCanvasProps {
  text: string;
  type: "llavero" | "decorativa";
  baseColor: string;
  textColor: string;
}

export default function TextPreviewCanvas({
  text,
  type,
  baseColor,
  textColor,
}: TextPreviewCanvasProps) {
  return (
    <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#1a1a1e]">
      <Canvas
        camera={{ position: [0, 0.5, 3], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-3, -2, 4]} intensity={0.3} color="#0A84FF" />
        <React.Suspense fallback={null}>
          <Text3DModel
            text={text}
            type={type}
            baseColor={baseColor}
            textColor={textColor}
          />
        </React.Suspense>
        <OrbitControls
          enablePan={false}
          minDistance={1.5}
          maxDistance={6}
          autoRotate
          autoRotateSpeed={1}
        />
      </Canvas>
    </div>
  );
}
