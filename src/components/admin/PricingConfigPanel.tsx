"use client";

import { useState, useEffect } from "react";
import { usePricing } from "@/contexts/PricingContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function PricingConfigPanel() {
  const { pricing, shippingCosts, minOrderPrice, loading } = usePricing();
  
  // Local state to hold edits before saving
  const [editedPricing, setEditedPricing] = useState(pricing);
  const [editedShipping, setEditedShipping] = useState(shippingCosts);
  const [editedMinOrder, setEditedMinOrder] = useState(minOrderPrice);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Sync when loading finishes
  useEffect(() => {
    if (!loading) {
      setEditedPricing(pricing);
      setEditedShipping(shippingCosts);
      setEditedMinOrder(minOrderPrice);
    }
  }, [loading, pricing, shippingCosts, minOrderPrice]);

  const handleMaterialPriceChange = (tech: string, mat: string, value: string) => {
    const val = parseFloat(value) || 0;
    setEditedPricing((prev: any) => ({
      ...prev,
      [tech]: {
        ...(prev[tech] || {}),
        [mat]: {
          ...(prev[tech]?.[mat] || {}),
          pricePerCm3: val,
        },
      },
    }));
  };

  const handleShippingChange = (method: string, value: string) => {
    const val = parseFloat(value) || 0;
    setEditedShipping((prev: any) => ({
      ...prev,
      [method]: {
        ...(prev[method] || {}),
        cost: val,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pricing: editedPricing,
          shippingCosts: editedShipping,
          minOrderPrice: editedMinOrder,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al guardar la configuración");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      console.error("Error saving pricing config:", e);
      alert(e.message || "Error al guardar la configuración");
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Cargando configuración...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Configuración de Precios</h2>
          <p className="text-sm text-muted-foreground">Ajusta los costos por material y envíos</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-cyan-500 hover:bg-cyan-600 text-black">
          {saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-lg text-sm">
          ✅ Configuración guardada correctamente. Los cambios ya están en vivo.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Material Pricing */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold border-b border-white/10 pb-2">Precios de Material (por cm³)</h3>
          
          {Object.entries(editedPricing).map(([tech, materials]) => (
            <div key={tech} className="glass rounded-xl p-5 space-y-4">
              <h4 className="font-medium text-cyan-400">{tech}</h4>
              <div className="space-y-3">
                {Object.entries(materials).map(([mat, info]: [string, any]) => (
                  <div key={mat} className="flex justify-between items-center gap-4">
                    <Label className="w-1/3">{info.label}</Label>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        value={info.pricePerCm3}
                        onChange={(e) => handleMaterialPriceChange(tech, mat, e.target.value)}
                        className="pl-8 bg-white/5 border-white/10"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* General & Shipping */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold border-b border-white/10 pb-2">Opciones Generales</h3>
          
          <div className="glass rounded-xl p-5 space-y-4">
            <div className="space-y-2">
              <Label>Pedido Mínimo (COP)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={editedMinOrder}
                  onChange={(e) => setEditedMinOrder(parseFloat(e.target.value) || 0)}
                  className="pl-8 bg-white/5 border-white/10"
                />
              </div>
              <p className="text-xs text-muted-foreground">Si un modelo cuesta menos que esto, se cobrará este valor.</p>
            </div>
          </div>

          <h3 className="text-lg font-semibold border-b border-white/10 pb-2">Costos de Envío</h3>
          
          <div className="glass rounded-xl p-5 space-y-4">
            {Object.entries(editedShipping).map(([method, info]: [string, any]) => (
              <div key={method} className="flex justify-between items-center gap-4">
                <Label className="w-1/3">{info.label}</Label>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={info.cost}
                    onChange={(e) => handleShippingChange(method, e.target.value)}
                    className="pl-8 bg-white/5 border-white/10"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
