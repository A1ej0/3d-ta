"use client";

import type { Technology } from "@/types";
import { PRICING, TECHNOLOGIES } from "@/lib/pricing";
import type { MaterialInfo } from "@/types";

interface ParameterPanelProps {
  technology: Technology;
  material: string;
  onTechnologyChange: (tech: Technology) => void;
  onMaterialChange: (mat: string) => void;
}

export default function ParameterPanel({
  technology,
  material,
  onTechnologyChange,
  onMaterialChange,
}: ParameterPanelProps) {
  const materials: Record<string, MaterialInfo> = PRICING[technology];
  const materialKeys = Object.keys(materials);

  const handleTechChange = (tech: Technology) => {
    onTechnologyChange(tech);
    const firstMat = Object.keys(PRICING[tech])[0];
    onMaterialChange(firstMat);
  };

  return (
    <div className="space-y-6">
      {/* Technology Selector */}
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-3 block">
          Tecnología de impresión
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(TECHNOLOGIES) as Technology[]).map((tech) => (
            <button
              key={tech}
              onClick={() => handleTechChange(tech)}
              className={`relative p-4 rounded-xl border text-left transition-all duration-300 ${
                technology === tech
                  ? "border-cyan-500/50 bg-cyan-500/5 shadow-lg shadow-cyan-500/10"
                  : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10"
              }`}
            >
              <div className="text-sm font-semibold mb-1">
                {TECHNOLOGIES[tech].label}
              </div>
              <div className="text-xs text-muted-foreground">
                {TECHNOLOGIES[tech].description}
              </div>
              {technology === tech && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Material Selector */}
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-3 block">
          Material
        </label>
        <div className="space-y-2">
          {materialKeys.map((mat) => {
            const info = materials[mat];
            const isSelected = material === mat;

            return (
              <button
                key={mat}
                onClick={() => onMaterialChange(mat)}
                className={`w-full p-4 rounded-xl border text-left transition-all duration-300 flex items-center gap-4 ${
                  isSelected
                    ? "border-cyan-500/50 bg-cyan-500/5 shadow-lg shadow-cyan-500/10"
                    : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10"
                }`}
              >
                {/* Color dot */}
                <div
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{
                    backgroundColor: info.color,
                    boxShadow: isSelected ? `0 0 8px ${info.color}` : "none",
                  }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{info.label}</span>
                    <span className="text-sm font-bold text-cyan-400">
                      ${info.pricePerCm3.toFixed(2)}/cm³
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {info.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
