"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const LithophanePreviewCanvas = dynamic(
  () => import("@/components/three/LithophanePreviewCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-[4/3] rounded-2xl bg-card flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Cargando visor 3D...</div>
      </div>
    ),
  }
);

export default function LitofaniasPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [processedImageSrc, setProcessedImageSrc] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);
  const [shape, setShape] = useState<"plana" | "curva">("plana");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        // Limit max size to 1024x1024 to prevent memory issues with huge photos
        let width = img.width;
        let height = img.height;
        const maxSize = 1024;
        if (width > height && width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        } else if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const imgData = ctx.getImageData(0, 0, width, height);
          const data = imgData.data;
          
          for (let i = 0; i < data.length; i += 4) {
            // Luma (grayscale) calculation
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            data[i] = gray;     // R
            data[i + 1] = gray; // G
            data[i + 2] = gray; // B
          }
          
          ctx.putImageData(imgData, 0, 0);
          setProcessedImageSrc(canvas.toDataURL("image/jpeg", 0.9));
          setGenerated(false); // Reset 3D view on new image
        }
      };
      img.src = url;
    }
  };

  const handleGenerate = () => {
    if (!imageSrc) return;
    setGenerated(true);
  };

  const whatsappMessage = encodeURIComponent(
    `¡Hola! Me gustaría cotizar una litofanía 3D ${shape === "curva" ? "curva" : "plana"}. Tengo la fotografía lista para enviar. ¿Cuánto costaría y qué tamaños manejan?`
  );

  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "573001234567";

  return (
    <main className="min-h-screen pt-24 pb-20 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/ideas" className="hover:text-primary transition-colors">Ideas</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Litofanías 3D</span>
        </div>

        {/* Header */}
        <div className="mb-12 animate-slide-up">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-foreground">
            Fotografías a <span className="text-primary">Litofanías 3D</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Sube tu foto favorita y visualiza cómo se verá convertida en una pieza de plástico que revela la imagen al ser iluminada por detrás.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Controls */}
          <div className="space-y-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="bg-card rounded-3xl p-6 md:p-8 apple-shadow space-y-6">
              
              {/* Image Upload */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">1. Sube tu fotografía</Label>
                <div 
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors cursor-pointer ${imageSrc ? 'border-primary/50 bg-primary/[0.02]' : 'border-border hover:border-primary/50 bg-accent/30'}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                  {imageSrc ? (
                    <div className="space-y-3">
                      <div className="relative w-full max-w-[200px] aspect-square mx-auto rounded-xl overflow-hidden shadow-sm">
                        <img src={imageSrc} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-sm text-primary font-medium">Cambiar imagen</p>
                    </div>
                  ) : (
                    <div className="space-y-2 py-4">
                      <div className="text-4xl">📸</div>
                      <p className="text-sm font-medium text-foreground">Haz clic para subir una foto</p>
                      <p className="text-xs text-muted-foreground">JPG, PNG o WEBP</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Shape Selector */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">2. Formato</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShape("plana")}
                    className={`p-4 rounded-2xl text-left transition-all duration-200 ${
                      shape === "plana"
                        ? "bg-primary/[0.08] ring-2 ring-primary/30"
                        : "bg-accent/60 hover:bg-accent"
                    }`}
                  >
                    <div className="text-2xl mb-2">🖼️</div>
                    <div className="text-sm font-semibold text-foreground">Plana</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Cuadro tradicional</div>
                  </button>
                  <button
                    onClick={() => setShape("curva")}
                    className={`p-4 rounded-2xl text-left transition-all duration-200 ${
                      shape === "curva"
                        ? "bg-primary/[0.08] ring-2 ring-primary/30"
                        : "bg-accent/60 hover:bg-accent"
                    }`}
                  >
                    <div className="text-2xl mb-2">🌙</div>
                    <div className="text-sm font-semibold text-foreground">Curva</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Se para sola por la curva</div>
                  </button>
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={!imageSrc}
                className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-base font-medium rounded-2xl shadow-none mt-2"
              >
                {generated ? "Actualizar Vista 3D" : "Generar Litofanía 3D"}
              </Button>
            </div>
          </div>

          {/* Right: 3D Preview + CTA */}
          <div className="space-y-5 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="bg-card rounded-3xl p-4 apple-shadow relative">
              {/* Overlay before generation */}
              {!generated && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-3xl">
                  <div className="text-4xl mb-3">✨</div>
                  <p className="text-sm font-medium text-foreground">Sube una foto y genera el 3D</p>
                </div>
              )}
              
              <LithophanePreviewCanvas
                imageSrc={generated ? processedImageSrc : null}
                shape={shape}
              />
              <p className="text-xs text-muted-foreground text-center mt-3 pb-2">
                🖱️ Arrastra para rotar · Simulación con luz trasera
              </p>
            </div>

            {/* Summary + WhatsApp CTA */}
            {generated && (
              <div className="bg-card rounded-3xl p-6 apple-shadow space-y-4 animate-slide-up">
                <h3 className="text-lg font-semibold text-foreground">Resumen</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Formato:</span>
                    <span className="text-foreground capitalize">{shape}</span>
                  </div>
                </div>
                <a
                  href={`https://wa.me/${phoneNumber}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium rounded-2xl transition-colors shadow-none mt-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
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
