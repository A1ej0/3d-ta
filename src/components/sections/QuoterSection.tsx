"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { useSTLVolume } from "@/hooks/useSTLVolume";
import STLDropzone from "@/components/quoter/STLDropzone";
import ParameterPanel from "@/components/quoter/ParameterPanel";
import PriceSummary from "@/components/quoter/PriceSummary";
import type { Technology } from "@/types";

const STLViewer = dynamic(() => import("@/components/quoter/STLViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-square sm:aspect-video rounded-xl glass flex items-center justify-center">
      <div className="text-sm text-muted-foreground">Cargando visor 3D...</div>
    </div>
  ),
});

export default function QuoterSection() {
  const [file, setFile] = useState<File | null>(null);
  const [technology, setTechnology] = useState<Technology>("FDM");
  const [material, setMaterial] = useState("PLA");

  const {
    geometry,
    volume,
    dimensions,
    triangleCount,
    isLoading,
    error,
    loadFile,
    reset,
  } = useSTLVolume();

  const handleFileLoad = (f: File) => {
    setFile(f);
    loadFile(f);
  };

  const handleReset = () => {
    setFile(null);
    reset();
  };

  return (
    <section id="cotizador" className="py-24 relative">
      {/* Background accents */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-gradient-radial from-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-gradient-radial from-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-cyan-500/30 text-cyan-400">
            Cotizador Automático
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Cotiza tu impresión <span className="gradient-text">al instante</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Sube tu archivo STL, selecciona material y obtén tu precio en tiempo real. Sin esperas.
          </p>
        </div>

        {/* Step 1: Upload */}
        <div className="max-w-2xl mx-auto mb-8">
          <STLDropzone
            onFileLoad={handleFileLoad}
            isLoading={isLoading}
            currentFile={file?.name || null}
            onReset={handleReset}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">
              {error}
            </div>
          </div>
        )}

        {/* Quoter Content (shown after file is loaded) */}
        {geometry && volume > 0 && (
          <div className="animate-slide-up">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left: 3D Viewer */}
              <div className="lg:col-span-5">
                <STLViewer geometry={geometry} />
                <p className="text-xs text-muted-foreground text-center mt-3">
                  🖱️ Arrastra para rotar · Scroll para zoom · Shift+click para mover
                </p>
              </div>

              {/* Center: Parameters */}
              <div className="lg:col-span-3">
                <ParameterPanel
                  technology={technology}
                  material={material}
                  onTechnologyChange={setTechnology}
                  onMaterialChange={setMaterial}
                />
              </div>

              {/* Right: Price Summary */}
              <div className="lg:col-span-4">
                <PriceSummary
                  volume={volume}
                  dimensions={dimensions}
                  triangleCount={triangleCount}
                  technology={technology}
                  material={material}
                  file={file}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
