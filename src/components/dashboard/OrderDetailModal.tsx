"use client";

import type { Order } from "@/types";
import { useEffect } from "react";

const formatCOP = (value: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(value);

const STATUS_STEPS = [
  { key: "Recibido", color: "bg-yellow-500", label: "Recibido" },
  { key: "En procesamiento", color: "bg-blue-500", label: "En proceso" },
  { key: "Impreso", color: "bg-cyan-500", label: "Impreso" },
  { key: "Enviado", color: "bg-purple-500", label: "Enviado" },
  { key: "Entregado", color: "bg-emerald-500", label: "Entregado" },
];

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
}

export default function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg glass-strong rounded-2xl border border-white/10 shadow-2xl shadow-black/50 animate-slide-up overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        {/* Thumbnail */}
        <div className="w-full h-48 bg-white/5 flex items-center justify-center">
          {order.thumbnailUrl ? (
            <img src={order.thumbnailUrl} alt="Preview del modelo 3D" className="w-full h-full object-contain" />
          ) : (
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground mx-auto mb-2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              <p className="text-xs text-muted-foreground">Sin preview</p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* File name & reference */}
          <div>
            <h3 className="text-lg font-bold">{order.fileName}</h3>
            <p className="text-xs text-muted-foreground mt-1">Ref: {order.reference}</p>
            {(order.userEmail || order.userPhone || order.shippingAddress) && (
              <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10 space-y-1">
                <p className="text-xs font-semibold text-cyan-400 mb-1">Datos del Cliente</p>
                {order.userEmail && <p className="text-sm text-foreground">{order.userEmail}</p>}
                {order.userPhone && <p className="text-sm text-foreground">Tel: {order.userPhone}</p>}
                {order.shippingAddress && (
                  <p className="text-sm text-foreground mt-2 border-t border-white/5 pt-2">
                    <span className="text-xs text-muted-foreground block mb-0.5">Dirección de envío:</span>
                    {order.shippingAddress}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Status Progress */}
          <div>
            <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-semibold">Estado del pedido</p>
            <div className="flex items-center gap-1">
              {STATUS_STEPS.map((step, i) => (
                <div key={step.key} className="flex-1 flex flex-col items-center">
                  <div className="flex items-center w-full">
                    <div
                      className={`w-4 h-4 rounded-full flex-shrink-0 border-2 transition-all ${
                        i <= currentStepIndex
                          ? `${step.color} border-transparent`
                          : "bg-transparent border-white/20"
                      }`}
                    />
                    {i < STATUS_STEPS.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 ${
                          i < currentStepIndex
                            ? "bg-gradient-to-r from-cyan-500 to-purple-500"
                            : "bg-white/10"
                        }`}
                      />
                    )}
                  </div>
                  <p className={`text-[10px] mt-1.5 text-center leading-tight ${
                    i <= currentStepIndex ? "text-foreground font-medium" : "text-muted-foreground"
                  }`}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Total Pagado</p>
              <p className="text-sm font-bold gradient-text">{formatCOP(order.totalPrice)}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Entrega</p>
              <p className="text-sm font-semibold">{order.deliveryType}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Tecnología</p>
              <p className="text-sm font-semibold">{order.technology}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Material</p>
              <p className="text-sm font-semibold">{order.material}</p>
            </div>
          </div>

          {/* Drive link */}
          {order.driveUrl && (
            order.driveUrl.startsWith("http") ? (
              <a
                href={order.driveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Ver archivo en Google Drive
              </a>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                {order.driveUrl}
              </div>
            )
          )}

          {/* Date */}
          <p className="text-xs text-muted-foreground">
            Pedido realizado el {order.createdAt instanceof Date ? order.createdAt.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" }) : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
