"use client";

import type { Technology } from "@/types";
import { TECHNOLOGIES } from "@/lib/pricing";
import { usePricing } from "@/contexts/PricingContext";

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
  const { pricing } = usePricing();
  
  type MaterialInfo = { pricePerCm3: number; label: string; description: string; color: string };
  const materials: Record<string, MaterialInfo> = pricing[technology];
  const materialKeys = Object.keys(materials);

  const handleTechChange = (tech: Technology) => {
    onTechnologyChange(tech);
    const firstMat = Object.keys(pricing[tech])[0];
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
              className={`relative p-4 rounded-2xl text-left transition-all duration-200 ${
                technology === tech
                  ? "bg-primary/[0.08] ring-2 ring-primary/30"
                  : "bg-card apple-shadow-sm hover:apple-shadow"
              }`}
            >
              <div className="text-sm font-semibold mb-1 text-foreground">
                {TECHNOLOGIES[tech].label}
              </div>
              <div className="text-xs text-muted-foreground">
                {TECHNOLOGIES[tech].description}
              </div>
              {technology === tech && (
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary" />
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
                className={`w-full p-4 rounded-2xl text-left transition-all duration-200 flex items-center gap-4 ${
                  isSelected
                    ? "bg-primary/[0.08] ring-2 ring-primary/30"
                    : "bg-card apple-shadow-sm hover:apple-shadow"
                }`}
              >
                {/* Color dot */}
                <div
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{
                    backgroundColor: info.color,
                    boxShadow: isSelected ? `0 0 8px ${info.color}40` : "none",
                  }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">{info.label}</span>
                    <span className="text-sm font-bold text-primary">
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
