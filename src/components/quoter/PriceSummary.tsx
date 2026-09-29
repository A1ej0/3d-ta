"use client";

import { Button } from "@/components/ui/button";
import {
  fitsInPrinter,
  PRINTER_VOLUMES,
  formatCOP,
} from "@/lib/pricing";
import type { Technology } from "@/types";
import Link from "next/link";
import { usePricing } from "@/contexts/PricingContext";

interface PriceSummaryProps {
  volume: number;
  dimensions: { x: number; y: number; z: number } | null;
  triangleCount: number;
  technology: Technology;
  material: string;
  file: File | null;
}

export default function PriceSummary({
  volume,
  dimensions,
  triangleCount,
  technology,
  material,
  file,
}: PriceSummaryProps) {
  const { pricing, minOrderPrice } = usePricing();

  // Calculate pricing based on current material & volume using dynamic context
  const materials = pricing[technology] as Record<string, { pricePerCm3: number; label: string }>;
  const materialInfo = materials[material];

  // Base price based on volume
  const basePrice = Math.round(volume * (materialInfo?.pricePerCm3 || 0));
  
  // Ensure minimum price
  const expectedPrice = Math.max(basePrice, minOrderPrice);

  // Size validation
  const fits = fitsInPrinter(dimensions, technology);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "573142273155";
  const whatsappMessage = encodeURIComponent(
    `¡Hola! Me gustaría continuar con mi cotización.\n\n` +
    (file ? `*Archivo:* ${file.name}\n` : "") +
    `*Tecnología:* ${technology}\n` +
    `*Material:* ${materialInfo?.label}\n` +
    `*Volumen:* ${volume.toFixed(2)} cm³\n` +
    `*Valor aproximado:* ${formatCOP(expectedPrice)}\n\n` +
    `Tengo el archivo listo para enviar.`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="space-y-5">
      {/* Model Info */}
      <div className="bg-card rounded-2xl p-5 space-y-3 apple-shadow">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Información del modelo
        </h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Volumen:</span>
            <span className="font-semibold text-primary">{volume.toFixed(2)} cm³</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Triángulos:</span>
            <span className="font-mono text-foreground">{triangleCount.toLocaleString()}</span>
          </div>
          {dimensions && (
            <div className="col-span-2 flex justify-between">
              <span className="text-muted-foreground">Dimensiones:</span>
              <span className="font-mono text-xs text-foreground">
                {dimensions.x.toFixed(1)} × {dimensions.y.toFixed(1)} × {dimensions.z.toFixed(1)} mm
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="bg-card rounded-2xl p-5 space-y-3 apple-shadow">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Cotización
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Material:</span>
            <span className="text-foreground">{materialInfo?.label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Precio unitario:</span>
            <span className="text-foreground">{formatCOP(materialInfo?.pricePerCm3 || 0)} / cm³</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cálculo original:</span>
            <span className={`font-mono text-xs ${basePrice < minOrderPrice ? "line-through text-muted-foreground opacity-50" : "text-foreground"}`}>
              {volume.toFixed(2)} × {formatCOP(materialInfo?.pricePerCm3 || 0)} = {formatCOP(basePrice)}
            </span>
          </div>
          {basePrice < minOrderPrice && (
            <div className="flex justify-between text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 p-2.5 rounded-xl border border-amber-200 dark:border-amber-500/20">
              <span>⚠️ Ajustado al mínimo de orden:</span>
              <span className="font-bold">{formatCOP(minOrderPrice)}</span>
            </div>
          )}
          
          <div className="flex justify-between items-baseline mt-4 pt-4 border-t border-border">
            <span className="font-semibold text-lg text-foreground">Valor Aproximado:</span>
            <span className="text-3xl font-bold text-primary">
              {formatCOP(expectedPrice)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            * El valor final puede variar según la complejidad y detalles de la pieza.
          </p>
        </div>
      </div>

      {/* Size Error / Warning */}
      {!fits && (
        <div className="rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 text-red-600 dark:text-red-400 text-sm space-y-2">
          <p className="font-semibold flex items-center gap-2">
            ⚠️ La pieza excede el tamaño máximo
          </p>
          <p>
            Esta tecnología ({technology}) permite un máximo de{" "}
            <strong>
              {PRINTER_VOLUMES[technology].x} × {PRINTER_VOLUMES[technology].y} × {PRINTER_VOLUMES[technology].z} mm
            </strong>. Tu modelo no cabe ni siquiera rotándolo óptimamente.
          </p>
          <p>
            Te sugerimos dividir la pieza o contáctanos directamente para analizar el caso.
          </p>
          <div className="pt-2 flex gap-3">
            <Link href="#contacto" className="underline hover:text-foreground">Formulario de contacto</Link>
            <a 
              href={`https://wa.me/${whatsappNumber}?text=Hola, tengo una pieza grande que necesito imprimir en partes.`}
              target="_blank" 
              rel="noopener noreferrer"
              className="underline text-green-600 dark:text-green-400 hover:opacity-80"
            >
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* WhatsApp Button */}
      <a
        href={volume <= 0 || !fits ? undefined : whatsappUrl}
        target={volume <= 0 || !fits ? undefined : "_blank"}
        rel="noopener noreferrer"
        className={`w-full h-14 text-base font-semibold bg-[#25D366] hover:bg-[#20b858] text-white rounded-2xl shadow-none transition-all duration-200 active:scale-[0.98] flex items-center justify-center ${volume <= 0 || !fits ? "opacity-50 pointer-events-none" : ""}`}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
        Continuar cotización por WhatsApp
      </a>
    </div>
  );
}
