import { createHash } from "crypto";

/**
 * Genera la firma de integridad para Wompi.
 * Concatena: referencia + monto (centavos) + moneda + secreto de integridad
 * y devuelve el hash SHA256.
 */
export function generateIntegritySignature(
  reference: string,
  amountInCents: number,
  currency: string = "COP"
): string {
  const integritySecret = process.env.WOMPI_INTEGRITY_SECRET!;
  const concatenated = `${reference}${amountInCents}${currency}${integritySecret}`;
  return createHash("sha256").update(concatenated).digest("hex");
}

/**
 * Genera una referencia única para la transacción de Wompi.
 */
export function generateReference(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `3DTA-${timestamp}-${random}`;
}
