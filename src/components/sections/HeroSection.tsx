"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-gradient-to-b from-background to-background" />
  ),
});

export default function HeroSection() {
  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="inicio"
      className="theme-dark bg-background text-foreground relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* 3D Background */}
      <HeroScene />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/10 to-background pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <div className="animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/[0.08] mb-8 text-sm font-medium text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Servicios profesionales de impresión 3D
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-[80px] font-bold leading-[1.05] tracking-tight mb-6 text-foreground">
            Damos vida a tus{" "}
            <span className="text-primary">ideas en 3D</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            Impresión 3D, modelado y escáner con tecnología de punta.
            Desde prototipos hasta producción, transformamos tu visión en realidad.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => scrollTo("#cotizador")}
              className="bg-primary hover:bg-primary/90 text-white rounded-full text-base px-8 h-12 shadow-none transition-all duration-200 active:scale-[0.98]"
            >
              Cotiza tu proyecto
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollTo("#servicios")}
              className="rounded-full text-base px-8 h-12 border-border hover:bg-accent"
            >
              Conoce nuestros servicios
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-in" style={{ animationDelay: "0.6s" }}>
          {[
            { value: "500+", label: "Proyectos" },
            { value: "FDM/SLA", label: "Tecnologías" },
            { value: "24h", label: "Entrega rápida" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
    </section>
  );
}
