import type { PricingConfig } from "@/types";

export const PRICING: PricingConfig = {
  FDM: {
    PLA: {
      pricePerCm3: 400,
      label: "PLA",
      description: "Económico y biodegradable. Ideal para prototipos y piezas decorativas.",
      color: "#22d3ee",
    },
    ABS: {
      pricePerCm3: 560,
      label: "ABS",
      description: "Alta resistencia térmica y mecánica. Perfecto para piezas funcionales.",
      color: "#f97316",
    },
    PETG: {
      pricePerCm3: 640,
      label: "PETG",
      description: "Combinación de resistencia y flexibilidad. Excelente para uso exterior.",
      color: "#a78bfa",
    },
  },
  SLA: {
    STANDARD: {
      pricePerCm3: 1400,
      label: "Resina Estándar",
      description: "Altísima precisión y acabado suave. Ideal para joyería y miniaturas.",
      color: "#34d399",
    },
    TOUGH: {
      pricePerCm3: 2000,
      label: "Resina Tenaz",
      description: "Resistente a impactos. Para piezas funcionales de alta calidad.",
      color: "#fb7185",
    },
  },
};

export const TECHNOLOGIES = {
  FDM: {
    label: "FDM (Filamento)",
    description: "Deposición de material fundido. Económico y versátil.",
  },
  SLA: {
    label: "SLA (Resina)",
    description: "Estereolitografía. Máxima precisión y detalle.",
  },
};

export function getMaterialsForTechnology(technology: "FDM" | "SLA") {
  return PRICING[technology];
}

export function getPrice(technology: "FDM" | "SLA", material: string): number {
  const materials = PRICING[technology] as Record<string, { pricePerCm3: number }>;
  return materials[material]?.pricePerCm3 ?? 0;
}

export function calculateTotalPrice(
  volume: number,
  technology: "FDM" | "SLA",
  material: string
): number {
  const pricePerCm3 = getPrice(technology, material);
  return Math.round(volume * pricePerCm3);
}

export const MIN_ORDER_PRICE = 20000; // Minimum order price in COP ($20,000)

export const PRINTER_VOLUMES = {
  FDM: { x: 220, y: 220, z: 250 },
  SLA: { x: 153.4, y: 87, z: 165 },
};

/**
 * Verifica si una pieza cabe dentro de una impresora, asumiendo que la pieza puede ser rotada
 * en incrementos de 90 grados para encontrar el mejor ajuste. 
 * Para simplificar, ordenamos las dimensiones de la pieza y las de la impresora de menor a mayor
 * y comprobamos que cada dimensión de la pieza sea menor a su contraparte en la impresora.
 */
export function fitsInPrinter(
  dimensions: { x: number; y: number; z: number } | null,
  technology: "FDM" | "SLA"
): boolean {
  if (!dimensions) return true;

  const pieceDims = [dimensions.x, dimensions.y, dimensions.z].sort((a, b) => a - b);
  
  const printer = PRINTER_VOLUMES[technology];
  const printerDims = [printer.x, printer.y, printer.z].sort((a, b) => a - b);

  return (
    pieceDims[0] <= printerDims[0] &&
    pieceDims[1] <= printerDims[1] &&
    pieceDims[2] <= printerDims[2]
  );
}

/**
 * Formatea un precio en COP con separadores de miles.
 */
export function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Shipping costs in COP
export const SHIPPING_COSTS = {
  recogida: { label: "Recogida en persona (Bogotá)", cost: 0 },
  bogota: { label: "Envío local (Bogotá)", cost: 10000 },
  nacional: { label: "Envío Nacional (Colombia)", cost: 20000 },
} as const;

export type ShippingMethod = keyof typeof SHIPPING_COSTS;
