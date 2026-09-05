"use client";

import { useState, useCallback } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { calculateVolumeFromGeometry, getDimensions } from "@/lib/stl-volume";

interface UseSTLVolumeReturn {
  geometry: THREE.BufferGeometry | null;
  volume: number;
  dimensions: { x: number; y: number; z: number } | null;
  triangleCount: number;
  isLoading: boolean;
  error: string | null;
  loadFile: (file: File) => void;
  reset: () => void;
}

export function useSTLVolume(): UseSTLVolumeReturn {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [volume, setVolume] = useState(0);
  const [dimensions, setDimensions] = useState<{ x: number; y: number; z: number } | null>(null);
  const [triangleCount, setTriangleCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFile = useCallback((file: File) => {
    setIsLoading(true);
    setError(null);

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;

        if (!arrayBuffer) {
          throw new Error("No se pudo leer el archivo");
        }

        const loader = new STLLoader();
        const geo = loader.parse(arrayBuffer);

        // Center the geometry
        geo.computeBoundingBox();
        geo.center();

        const vol = calculateVolumeFromGeometry(geo);
        const dims = getDimensions(geo);
        const tris = geo.attributes.position.count / 3;

        setGeometry(geo);
        setVolume(Math.round(vol * 100) / 100);
        setDimensions(dims);
        setTriangleCount(tris);
        setIsLoading(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? `Error al procesar el archivo STL: ${err.message}`
            : "Error desconocido al procesar el archivo"
        );
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError("Error al leer el archivo. Intenta de nuevo.");
      setIsLoading(false);
    };

    reader.readAsArrayBuffer(file);
  }, []);

  const reset = useCallback(() => {
    if (geometry) {
      geometry.dispose();
    }
    setGeometry(null);
    setVolume(0);
    setDimensions(null);
    setTriangleCount(0);
    setError(null);
  }, [geometry]);

  return {
    geometry,
    volume,
    dimensions,
    triangleCount,
    isLoading,
    error,
    loadFile,
    reset,
  };
}
