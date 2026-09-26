"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useSTLVolume } from "@/hooks/useSTLVolume";
import STLDropzone from "@/components/quoter/STLDropzone";
import ParameterPanel from "@/components/quoter/ParameterPanel";
import PriceSummary from "@/components/quoter/PriceSummary";
import type { Technology } from "@/types";
import { PricingProvider } from "@/contexts/PricingContext";

const STLViewer = dynamic(() => import("@/components/quoter/STLViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-square sm:aspect-video rounded-2xl bg-card apple-shadow flex items-center justify-center">
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
    <PricingProvider>
      <section id="cotizador" className="theme-light bg-background text-foreground py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">
            Cotizador Automático
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 text-foreground">
            Cotiza tu impresión <span className="text-primary">al instante</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
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
            <div className="rounded-2xl bg-destructive/[0.06] border border-destructive/10 p-4 text-destructive text-sm">
              {error}
            </div>
          </div>
        )}

        {/* Quoter Content (shown after file is loaded) */}
        {geometry && volume > 0 && (
          <div className="animate-slide-up">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
    </PricingProvider>
  );
}
