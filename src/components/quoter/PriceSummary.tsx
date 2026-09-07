"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PRICING,
  MIN_ORDER_PRICE,
  fitsInPrinter,
  PRINTER_VOLUMES,
  formatCOP,
  SHIPPING_COSTS,
  type ShippingMethod,
} from "@/lib/pricing";
import type { Technology } from "@/types";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user, userProfile } = useAuth();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("recogida");

  // Auto-fill user data when logged in
  useEffect(() => {
    if (user) {
      setCustomerName(user.displayName || "");
      setCustomerEmail(user.email || "");
    }
  }, [user]);

  const materials = PRICING[technology] as Record<string, { pricePerCm3: number; label: string }>;
  const materialInfo = materials[material];
  const pricePerCm3 = materialInfo?.pricePerCm3 ?? 0;
  const totalPrice = Math.round(volume * pricePerCm3);
  const finalPrice = Math.max(totalPrice, MIN_ORDER_PRICE);

  // Shipping calculation
  const shippingCost = SHIPPING_COSTS[shippingMethod].cost;
  const grandTotal = finalPrice + shippingCost;

  // Size validation
  const fits = fitsInPrinter(dimensions, technology);

  const openWompiWidget = useCallback(
    (
      reference: string,
      amountInCents: number,
      signature: string,
      publicKey: string,
      redirectUrl: string
    ) => {
      // Open Wompi Checkout Widget
      const checkout = new (window as unknown as { WidgetCheckout: new (config: Record<string, unknown>) => { open: (cb: (result: Record<string, unknown>) => void) => void } }).WidgetCheckout({
        currency: "COP",
        amountInCents,
        reference,
        publicKey,
        redirectUrl,
        signature: {
          integrity: signature,
        },
        customerData: {
          email: customerEmail.trim(),
          fullName: customerName.trim(),
        },
      });
      checkout.open((result: Record<string, unknown>) => {
        const transaction = result?.transaction as Record<string, unknown> | undefined;
        console.log("Wompi transaction result:", transaction);
        if (transaction && (transaction.status === "APPROVED" || transaction.status === "PENDING")) {
          window.location.href = `${redirectUrl}?id=${transaction.id || ""}`;
        } else {
          setIsProcessing(false);
        }
      });
    },
    [customerEmail, customerName]
  );

  // Capture thumbnail from the 3D canvas
  const captureThumbnail = (): Blob | null => {
    try {
      const canvas = document.querySelector(".canvas-container canvas") as HTMLCanvasElement;
      if (!canvas) return null;
      const dataUrl = canvas.toDataURL("image/png");
      const byteString = atob(dataUrl.split(",")[1]);
      const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: mimeString });
    } catch {
      console.warn("Could not capture thumbnail");
      return null;
    }
  };

  const handleCheckout = async () => {
    if (!file) return;
    if (!customerName.trim() || !customerEmail.trim()) {
      setError("Por favor ingresa tu nombre y email.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Step 1A: Get resumable upload URL for STL
      const urlRes = await fetch("/api/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          mimeType: file.type || "model/stl",
        }),
      });

      if (!urlRes.ok) {
        const urlData = await urlRes.json();
        throw new Error(urlData.error || "Error al inicializar la subida");
      }

      const { uploadUrl, fileId: stlFileId } = await urlRes.json();

      // Step 1B: Upload STL file directly to Google Drive via PUT
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "model/stl",
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error(`Error subiendo el archivo: ${uploadRes.statusText}`);
      }

      const driveUrl = stlFileId
        ? `https://drive.google.com/file/d/${stlFileId}/view`
        : `Google Drive (Nombre: ${file.name})`;

      // Step 1C: Capture and upload thumbnail
      let thumbnailUrl = "";
      const thumbnailBlob = captureThumbnail();
      if (thumbnailBlob) {
        try {
          const thumbName = file.name.replace(/\.[^.]+$/, "") + "_preview.png";
          const thumbUrlRes = await fetch("/api/upload-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: thumbName,
              mimeType: "image/png",
            }),
          });
          if (thumbUrlRes.ok) {
            const { uploadUrl: thumbUploadUrl, fileId: thumbFileId } = await thumbUrlRes.json();
            const thumbUploadRes = await fetch(thumbUploadUrl, {
              method: "PUT",
              headers: { "Content-Type": "image/png" },
              body: thumbnailBlob,
            });
            if (thumbUploadRes.ok && thumbFileId) {
              thumbnailUrl = `https://drive.google.com/thumbnail?id=${thumbFileId}&sz=w400`;
            }
          }
        } catch {
          console.warn("Thumbnail upload failed, continuing without it");
        }
      }

      // Step 2: Get Wompi checkout data from our backend
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileUrl: driveUrl,
          fileName: file.name,
          volume,
          technology,
          material,
          totalPrice: finalPrice,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          shippingMethod,
          shippingCost,
          thumbnailUrl,
          userId: user?.uid || "",
          userPhone: userProfile?.phone || "",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear la orden");
      }

      const data = await res.json();

      // Step 3: Open Wompi Widget
      openWompiWidget(
        data.reference,
        data.amountInCents,
        data.signature,
        data.publicKey,
        data.redirectUrl
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Model Info */}
      <div className="glass rounded-xl p-5 space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Información del modelo
        </h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Volumen:</span>
            <span className="font-semibold text-cyan-400">{volume.toFixed(2)} cm³</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Triángulos:</span>
            <span className="font-mono">{triangleCount.toLocaleString()}</span>
          </div>
          {dimensions && (
            <div className="col-span-2 flex justify-between">
              <span className="text-muted-foreground">Dimensiones:</span>
              <span className="font-mono text-xs">
                {dimensions.x.toFixed(1)} × {dimensions.y.toFixed(1)} × {dimensions.z.toFixed(1)} mm
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="glass rounded-xl p-5 space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Cotización
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Material:</span>
            <span>{materialInfo?.label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Precio unitario:</span>
            <span>{formatCOP(pricePerCm3)} / cm³</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cálculo original:</span>
            <span className={`font-mono text-xs ${totalPrice < MIN_ORDER_PRICE ? "line-through text-muted-foreground opacity-50" : ""}`}>
              {volume.toFixed(2)} × {formatCOP(pricePerCm3)} = {formatCOP(totalPrice)}
            </span>
          </div>
          {totalPrice < MIN_ORDER_PRICE && (
            <div className="flex justify-between text-xs text-amber-400 bg-amber-500/10 p-2 rounded-md border border-amber-500/20">
              <span>⚠️ Ajustado al mínimo de orden:</span>
              <span className="font-bold">{formatCOP(MIN_ORDER_PRICE)}</span>
            </div>
          )}
          <div className="h-px bg-white/10 my-2" />
          
          <div className="space-y-1.5 pb-2">
            <Label className="text-xs text-muted-foreground">Método de Envío</Label>
            <Select value={shippingMethod} onValueChange={(v) => setShippingMethod(v as ShippingMethod)}>
              <SelectTrigger className="h-8 bg-white/5 border-white/10 text-xs">
                <SelectValue placeholder="Selecciona un método" />
              </SelectTrigger>
              <SelectContent className="glass-strong border-white/10">
                {Object.entries(SHIPPING_COSTS).map(([key, { label, cost }]) => (
                  <SelectItem key={key} value={key}>
                    {label} — {cost === 0 ? "Gratis" : formatCOP(cost)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {shippingCost > 0 && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Envío:</span>
              <span>+ {formatCOP(shippingCost)}</span>
            </div>
          )}

          <div className="flex justify-between items-baseline">
            <span className="font-semibold text-lg">Total:</span>
            <span className="text-3xl font-bold gradient-text">
              {formatCOP(grandTotal)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">COP · Impuestos incluidos</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="glass rounded-xl p-5 space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Datos para la orden
        </h4>
        {user ? (
          <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
            {user.photoURL && (
              <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full" referrerPolicy="no-referrer" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user.displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <span className="ml-auto text-xs text-emerald-400">✓ Sesión activa</span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="customer-name" className="text-xs">Nombre *</Label>
              <Input
                id="customer-name"
                placeholder="Tu nombre"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="bg-white/5 border-white/10 h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customer-email" className="text-xs">Email *</Label>
              <Input
                id="customer-email"
                type="email"
                placeholder="tu@email.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="bg-white/5 border-white/10 h-9 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Size Error / Warning */}
      {!fits && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm space-y-2">
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
            <Link href="#contacto" className="underline hover:text-white">Formulario de contacto</Link>
            <a 
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Hola, tengo una pieza grande que necesito imprimir en partes.`}
              target="_blank" 
              rel="noopener noreferrer"
              className="underline text-emerald-400 hover:text-emerald-300"
            >
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Checkout Button */}
      <Button
        onClick={handleCheckout}
        disabled={isProcessing || !file || volume <= 0 || !fits}
        className="w-full h-14 text-base font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white border-0 shadow-xl shadow-cyan-500/20 transition-all duration-300 hover:shadow-cyan-500/30"
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Procesando...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            Pagar con Wompi — {formatCOP(grandTotal)}
          </span>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        🔒 Pago seguro procesado por Wompi (Bancolombia)
      </p>
    </div>
  );
}
