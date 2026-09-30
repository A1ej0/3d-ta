"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";

const ProductViewerCanvas = dynamic(
  () => import("@/components/three/ProductViewerCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-square rounded-2xl bg-card apple-shadow flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Cargando visor 3D...</div>
      </div>
    ),
  }
);

export default function KeycapsPage() {
  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "573001234567";
  const whatsappMessage = encodeURIComponent(
    "¡Hola! Me gustaría cotizar la impresión de un keycap personalizado. ¿Cómo es el proceso y cuánto costaría?"
  );

  return (
    <main className="min-h-screen pt-24 pb-20 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/ideas" className="hover:text-primary transition-colors">Ideas</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Keycaps Custom</span>
        </div>

        {/* Header */}
        <div className="mb-12 animate-slide-up">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-foreground">
            Keycaps <span className="text-primary">Custom</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Personaliza tu teclado mecánico con teclas artesanales. Cada keycap es una pieza única impresa en resina de alta resolución y acabada a mano.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Info & CTA */}
          <div className="space-y-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="bg-card rounded-3xl p-6 md:p-8 apple-shadow space-y-6">
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">Servicio de Impresión 3D de Keycaps</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Creamos keycaps personalizados compatibles con switches Cherry MX y similares. Desde diseños minimalistas hasta piezas esculturales complejas, materializamos tu idea.
                </p>
                
                <ul className="space-y-3 mt-4">
                  <li className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="text-primary text-base">✨</span>
                    <span><strong>Alta Resolución:</strong> Impresión en resina SLA para capturar hasta el más mínimo detalle.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="text-primary text-base">🎨</span>
                    <span><strong>Acabados a Medida:</strong> Opciones de resina translúcida, colores sólidos o pintado a mano.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="text-primary text-base">⌨️</span>
                    <span><strong>Ajuste Perfecto:</strong> Diseño optimizado para encajar a la perfección en tu teclado.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-border">
                <a
                  href={`https://wa.me/${phoneNumber}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full h-14 bg-[#25D366] hover:bg-[#22c55e] text-white text-base font-semibold rounded-2xl transition-all duration-200 active:scale-[0.98]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Cotizar mi diseño por WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Right: 3D Preview */}
          <div className="space-y-5 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="bg-card rounded-3xl p-4 apple-shadow">
              <div className="aspect-square relative rounded-2xl overflow-hidden bg-accent/30">
                <ProductViewerCanvas modelPath="/models/keycaps/keycap-01.glb" />
              </div>
              <p className="text-xs text-muted-foreground text-center mt-3 pb-2">
                🖱️ Arrastra para rotar el modelo de ejemplo · Scroll para zoom
              </p>
            </div>
            
            {/* Show the first image as a gallery reference */}
            <div className="bg-card rounded-3xl p-4 apple-shadow flex gap-4 overflow-x-auto snap-x pb-4 hide-scrollbar">
               <div className="relative w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden snap-center ring-2 ring-primary">
                 <Image src="/ideas/keycaps/keycap-01.jpg" alt="Dragon Keycap" fill className="object-cover" />
               </div>
               <div className="flex items-center justify-center w-24 h-24 flex-shrink-0 rounded-2xl bg-accent/50 text-xs text-muted-foreground text-center p-2 snap-center">
                 Tu diseño aquí
               </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
