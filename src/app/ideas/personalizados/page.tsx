"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const TextPreviewCanvas = dynamic(
  () => import("@/components/three/TextPreviewCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-[4/3] rounded-2xl bg-card apple-shadow flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Cargando visor 3D...</div>
      </div>
    ),
  }
);


export default function PersonalizadosPage() {
  const [text, setText] = useState("");
  const [type, setType] = useState<"llavero" | "decorativa">("llavero");
  const [generated, setGenerated] = useState(false);
  const [previewText, setPreviewText] = useState("3D-Ta");


  const handleGenerate = () => {
    if (!text.trim()) return;
    setPreviewText(text.trim());
    setGenerated(true);
  };

  const whatsappMessage = encodeURIComponent(
    `¡Hola! Me gustaría cotizar un${type === "llavero" ? " llavero" : "a palabra decorativa"} personalizado(a) con el texto: "${previewText}". ¿Cuánto costaría?`
  );

  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "573001234567";

  return (
    <main className="min-h-screen pt-24 pb-20 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/ideas" className="hover:text-primary transition-colors">Ideas</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Nombres y Llaveros</span>
        </div>

        {/* Header */}
        <div className="mb-12 animate-slide-up">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-foreground">
            Nombres y Llaveros <span className="text-primary">Personalizados</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Escribe tu texto, elige el tipo de producto y visualízalo en 3D al instante. Luego cotízalo directamente por WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Controls */}
          <div className="space-y-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            {/* Text Input */}
            <div className="bg-card rounded-3xl p-6 md:p-8 apple-shadow space-y-5">
              <div className="space-y-2">
                <Label htmlFor="custom-text" className="text-sm font-medium">
                  Tu texto o palabra
                </Label>
                <Input
                  id="custom-text"
                  placeholder="Ej: ALEJO, MAMA, LOVE..."
                  value={text}
                  onChange={(e) => {
                    // Strip out emojis and special unicode symbols as the 3D font only supports basic latin
                    const sanitized = e.target.value.replace(/[\u{1F300}-\u{1F9FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{1F1E6}-\u{1F1FF}]/gu, '');
                    setText(sanitized);
                  }}
                  maxLength={20}
                  className="bg-accent/60 border-transparent h-12 text-base rounded-xl focus:border-primary/30 focus:ring-primary/20"
                />
                <p className="text-xs text-muted-foreground">{text.length}/20 caracteres · Sin emojis</p>
              </div>

              {/* Type Selector */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Tipo de producto</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setType("llavero")}
                    className={`p-4 rounded-2xl text-left transition-all duration-200 ${
                      type === "llavero"
                        ? "bg-primary/[0.08] ring-2 ring-primary/30"
                        : "bg-accent/60 hover:bg-accent"
                    }`}
                  >
                    <div className="text-2xl mb-2">🔑</div>
                    <div className="text-sm font-semibold text-foreground">Llavero</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Fino, con argolla
                    </div>
                  </button>
                  <button
                    onClick={() => setType("decorativa")}
                    className={`p-4 rounded-2xl text-left transition-all duration-200 ${
                      type === "decorativa"
                        ? "bg-primary/[0.08] ring-2 ring-primary/30"
                        : "bg-accent/60 hover:bg-accent"
                    }`}
                  >
                    <div className="text-2xl mb-2">🏠</div>
                    <div className="text-sm font-semibold text-foreground">Palabra Decorativa</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Grueso, se para sola
                    </div>
                  </button>
                </div>
              </div>


              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={!text.trim()}
                className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-base font-medium rounded-2xl shadow-none"
              >
                {generated ? "Actualizar Vista 3D" : "Generar Vista 3D"}
              </Button>
            </div>
          </div>

          {/* Right: 3D Preview + CTA */}
          <div className="space-y-5 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            {/* 3D Viewer */}
            <div className="bg-card rounded-3xl p-4 apple-shadow">
              <TextPreviewCanvas
                text={previewText}
                type={type}
                baseColor="#FFFFFF"
                textColor="#0066FF"
              />
              <p className="text-xs text-muted-foreground text-center mt-3 pb-2">
                🖱️ Arrastra para rotar · Scroll para zoom
              </p>
            </div>

            {/* Summary + WhatsApp CTA */}
            {generated && (
              <div className="bg-card rounded-3xl p-6 apple-shadow space-y-4 animate-slide-up">
                <h3 className="text-lg font-semibold text-foreground">Resumen</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Texto:</span>
                    <span className="font-semibold text-foreground">&ldquo;{previewText}&rdquo;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span className="text-foreground capitalize">{type === "llavero" ? "Llavero" : "Palabra decorativa"}</span>
                  </div>

                </div>
                <a
                  href={`https://wa.me/${phoneNumber}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full h-14 bg-[#25D366] hover:bg-[#22c55e] text-white text-base font-semibold rounded-2xl transition-all duration-200 active:scale-[0.98]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Cotizar por WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
