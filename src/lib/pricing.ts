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
      pricePerCm3: 500,
      label: "ABS",
      description: "Alta resistencia térmica y mecánica. Perfecto para piezas funcionales.",
      color: "#f97316",
    },
    PETG: {
      pricePerCm3: 450,
      label: "PETG",
      description: "Combinación de resistencia y flexibilidad. Excelente para uso exterior.",
      color: "#a78bfa",
    },
    TPU: {
      pricePerCm3: 700,
      label: "TPU",
      description: "Elastomérico, flexible y resistente al desgaste. Ideal para fundas, juntas, correas y piezas que requieran absorción de impactos y flexión.",
      color: "#52d45fff",
    },
  },
  SLA: {
    STANDARD: {
      pricePerCm3: 1000,
      label: "Resina Estándar",
      description: "Altísima precisión y acabado suave. Ideal para joyería y miniaturas.",
      color: "#34d399",
    },
    TOUGH: {
      pricePerCm3: 1500,
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
  FDM: { x: 256, y: 256, z: 256 },
  SLA: { x: 153.4, y: 87, z: 165 },
};

function rectFitsInRect(a: number, b: number, W: number, H: number): boolean {
  if ((a <= W && b <= H) || (a <= H && b <= W)) return true;
  if (a * a + b * b > W * W + H * H) return false;

  for (let deg = 1; deg < 90; deg += 1) {
    const rad = (deg * Math.PI) / 180;
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    const w = a * c + b * s;
    const h = a * s + b * c;
    if ((w <= W && h <= H) || (w <= H && h <= W)) return true;
  }
  return false;
}

function fitsPlanar(d1: number, d2: number, d3: number, Px: number, Py: number, Pz: number): boolean {
  if (d3 <= Pz && rectFitsInRect(d1, d2, Px, Py)) return true;
  if (d2 <= Pz && rectFitsInRect(d1, d3, Px, Py)) return true;
  if (d1 <= Pz && rectFitsInRect(d2, d3, Px, Py)) return true;
  return false;
}

/**
 * Verifica si una pieza cabe dentro de una impresora, considerando rotaciones
 * ortogonales (90°), rotación plana sobre la cama (diagonal 2D), o inclinación en 3D.
 */
export function fitsInPrinter(
  dimensions: { x: number; y: number; z: number } | null,
  technology: "FDM" | "SLA"
): boolean {
  if (!dimensions || !dimensions.x || !dimensions.y || !dimensions.z) return true;

  const dx = dimensions.x;
  const dy = dimensions.y;
  const dz = dimensions.z;

  const printer = PRINTER_VOLUMES[technology];
  const Px = printer.x;
  const Py = printer.y;
  const Pz = printer.z;

  // 1. Comprobación rápida ortogonal (rotación básica de 90°)
  const pSorted = [dx, dy, dz].sort((a, b) => a - b);
  const bSorted = [Px, Py, Pz].sort((a, b) => a - b);
  if (pSorted[0] <= bSorted[0] && pSorted[1] <= bSorted[1] && pSorted[2] <= bSorted[2]) {
    return true;
  }

  // 2. Comprobación de límite de diagonal 3D
  const pieceDiagSq = dx * dx + dy * dy + dz * dz;
  const printerDiagSq = Px * Px + Py * Py + Pz * Pz;
  if (pieceDiagSq > printerDiagSq + 0.01) {
    return false;
  }

  // 3. Rotación en el plano de la cama (diagonal 2D de la base)
  if (fitsPlanar(dx, dy, dz, Px, Py, Pz)) return true;
  if (fitsPlanar(dx, dy, dz, Py, Pz, Px)) return true;
  if (fitsPlanar(dx, dy, dz, Pz, Px, Py)) return true;

  // 4. Búsqueda de rotación tridimensional (inclinación 3D)
  for (let pitch = 0; pitch <= 90; pitch += 3) {
    const pRad = (pitch * Math.PI) / 180;
    const cp = Math.cos(pRad), sp = Math.sin(pRad);
    for (let roll = 0; roll <= 90; roll += 3) {
      const rRad = (roll * Math.PI) / 180;
      const cr = Math.cos(rRad), sr = Math.sin(rRad);
      for (let yaw = 0; yaw <= 90; yaw += 3) {
        const yRad = (yaw * Math.PI) / 180;
        const cy = Math.cos(yRad), sy = Math.sin(yRad);

        const r00 = Math.abs(cy * cp);
        const r01 = Math.abs(cy * sp * sr - sy * cr);
        const r02 = Math.abs(cy * sp * cr + sy * sr);

        const r10 = Math.abs(sy * cp);
        const r11 = Math.abs(sy * sp * sr + cy * cr);
        const r12 = Math.abs(sy * sp * cr - cy * sr);

        const r20 = Math.abs(-sp);
        const r21 = Math.abs(cp * sr);
        const r22 = Math.abs(cp * cr);

        const ex = r00 * dx + r01 * dy + r02 * dz;
        const ey = r10 * dx + r11 * dy + r12 * dz;
        const ez = r20 * dx + r21 * dy + r22 * dz;

        if (ex <= Px && ey <= Py && ez <= Pz) return true;
      }
    }
  }

  return false;
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
