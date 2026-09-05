"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function SuccessPage() {
  useEffect(() => {
    // Si Wompi nos redirigió a lvh.me (para saltarse el Firewall), volvemos automáticamente a localhost
    if (typeof window !== "undefined" && window.location.hostname === "lvh.me") {
      window.location.hostname = "localhost";
    }
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center glass rounded-2xl p-10 animate-slide-up">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-emerald-400"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-3">
          ¡Pago <span className="text-emerald-400">exitoso</span>!
        </h1>

        <p className="text-muted-foreground mb-2">
          Tu orden de impresión 3D ha sido procesada correctamente.
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          Recibirás un correo de confirmación. Nos pondremos en contacto contigo para coordinar la entrega.
        </p>

        <Link href="/">
          <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white border-0">
            Volver al inicio
          </Button>
        </Link>
      </div>
    </main>
  );
}
