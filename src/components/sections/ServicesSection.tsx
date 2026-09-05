"use client";

import { Badge } from "@/components/ui/badge";

const SERVICES = [
  {
    title: "Impresión 3D",
    description:
      "Servicio de impresión en tecnologías FDM (filamento) y SLA (resina). Piezas funcionales, prototipos y producción a medida con materiales de alta calidad.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
    features: ["PLA, ABS, PETG", "Resinas estándar y tenaz", "Hasta 300mm"],
    gradient: "from-cyan-500 to-blue-600",
    glowColor: "shadow-cyan-500/20",
  },
  {
    title: "Modelado 3D",
    description:
      "Diseño y modelado profesional para cualquier proyecto. Desde piezas mecánicas hasta personajes y prototipos. Archivos listos para impresión.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
        <line x1="12" y1="22" x2="12" y2="15.5"/>
        <polyline points="22 8.5 12 15.5 2 8.5"/>
        <polyline points="2 15.5 12 8.5 22 15.5"/>
        <line x1="12" y1="2" x2="12" y2="8.5"/>
      </svg>
    ),
    features: ["CAD paramétrico", "Diseño orgánico", "Ingeniería inversa"],
    gradient: "from-purple-500 to-pink-600",
    glowColor: "shadow-purple-500/20",
  },
  {
    title: "Escáner 3D",
    description:
      "Digitalización de objetos reales a modelos 3D de alta fidelidad. Ideal para réplicas, control de calidad e ingeniería inversa.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
        <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
        <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
        <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
        <line x1="7" y1="12" x2="17" y2="12"/>
        <line x1="12" y1="7" x2="12" y2="17"/>
      </svg>
    ),
    features: ["Alta precisión", "Texturas reales", "Exportación múltiple"],
    gradient: "from-emerald-500 to-teal-600",
    glowColor: "shadow-emerald-500/20",
  },
];

export default function ServicesSection() {
  return (
    <section id="servicios" className="py-24 relative">
      {/* Background accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-radial from-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-cyan-500/30 text-cyan-400">
            Nuestros Servicios
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Soluciones <span className="gradient-text">3D completas</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Todo lo que necesitas para materializar tus proyectos, desde el diseño digital hasta la pieza física.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
          {SERVICES.map((service) => (
            <div
              key={service.title}
              className={`group relative glass rounded-2xl p-8 hover:bg-white/[0.06] transition-all duration-500 hover:shadow-xl ${service.glowColor} hover:-translate-y-1`}
            >
              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                {service.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold mb-3 text-foreground">
                {service.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                {service.description}
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {service.features.map((feature) => (
                  <span
                    key={feature}
                    className="text-xs px-3 py-1 rounded-full bg-white/5 text-muted-foreground border border-white/5"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {/* Hover gradient border effect */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
