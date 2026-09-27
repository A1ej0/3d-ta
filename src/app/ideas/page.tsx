import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ideas 3D | 3D-Ta",
  description: "Explora nuestras ideas y productos personalizados de impresión 3D: llaveros, keycaps y materas.",
};

const IDEAS = [
  {
    title: "Nombres y Llaveros",
    subtitle: "Personalizados",
    description: "Crea tu propio llavero o palabra decorativa en 3D. Escribe tu texto y visualízalo al instante.",
    href: "/ideas/personalizados",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/>
        <path d="M14 3v4a2 2 0 0 0 2 2h4"/>
        <path d="M8 13h.01"/>
        <path d="M16 13h.01"/>
        <path d="M10 17s1 1 2 1 2-1 2-1"/>
      </svg>
    ),
    gradient: "from-blue-500/20 to-cyan-500/20",
    span: "", // Removed col-span-2 to make it part of 2x2 grid
  },
  {
    title: "Keycaps",
    subtitle: "Custom",
    description: "Teclas artesanales para tu teclado mecánico. Diseños exclusivos impresos en resina de alta calidad.",
    href: "/ideas/keycaps",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="8" x="2" y="14" rx="2"/>
        <path d="M6.5 14v-4a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v4"/>
        <path d="M6 18h.01"/>
        <path d="M10 18h.01"/>
        <path d="M14 18h.01"/>
        <path d="M18 18h.01"/>
      </svg>
    ),
    gradient: "from-purple-500/20 to-pink-500/20",
    span: "",
  },
  {
    title: "Materas",
    subtitle: "3D",
    description: "Macetas con diseños geométricos, orgánicos y artísticos. Ideales para suculentas y decoración.",
    href: "/ideas/materas",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 20h10"/>
        <path d="M10 20c5.5-2.5.8-6.4 3-10"/>
        <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/>
        <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>
      </svg>
    ),
    gradient: "from-green-500/20 to-emerald-500/20",
    span: "",
  },
  {
    title: "Fotografías",
    subtitle: "Litofanías 3D",
    description: "Convierte tus fotos favoritas en piezas 3D que revelan su imagen al ser iluminadas por detrás.",
    href: "/ideas/litofanias",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
        <circle cx="9" cy="9" r="2"/>
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
      </svg>
    ),
    gradient: "from-yellow-500/20 to-orange-500/20",
    span: "",
  },
];

export default function IdeasPage() {
  return (
    <main className="min-h-screen pt-24 pb-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/[0.08] mb-6 text-sm font-medium text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Nuevo
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-[72px] font-bold leading-[1.05] tracking-tight mb-6 text-foreground">
            Explora nuestras <span className="text-primary">ideas</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Productos diseñados y listos para personalizar. Elige una categoría, explora los diseños y cotiza directamente.
          </p>
        </div>

        {/* Apple-style Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          {IDEAS.map((idea) => (
            <Link
              key={idea.href}
              href={idea.href}
              className={`group relative bg-card rounded-3xl p-8 md:p-10 overflow-hidden transition-all duration-300 hover:-translate-y-1 apple-shadow hover:apple-shadow-lg ${idea.span}`}
            >
              {/* Background gradient blob */}
              <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${idea.gradient} rounded-full blur-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 -translate-y-1/3 translate-x-1/4`} />

              <div className="relative z-10 h-full flex flex-col justify-between min-h-[200px]">
                <div>
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-primary/[0.08] flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                    {idea.icon}
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                    {idea.title}
                  </h2>
                  <p className="text-lg text-primary font-semibold mb-3">
                    {idea.subtitle}
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
                    {idea.description}
                  </p>
                </div>

                {/* CTA arrow */}
                <div className="flex items-center gap-2 mt-6 text-primary text-sm font-medium">
                  Explorar
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
