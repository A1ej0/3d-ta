"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";

const ProductViewerCanvas = dynamic(
  () => import("@/components/three/ProductViewerCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-square rounded-2xl bg-[#1a1a1e] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    ),
  }
);

export interface GalleryItem {
  id: string;
  name: string;
  description: string;
  image: string;
  modelPath?: string; // .glb file path
}

interface ProductGalleryPageProps {
  title: string;
  titleHighlight: string;
  subtitle: string;
  breadcrumb: string;
  items: GalleryItem[];
  whatsappIntro: string;
}

export default function ProductGalleryPage({
  title,
  titleHighlight,
  subtitle,
  breadcrumb,
  items,
  whatsappIntro,
}: ProductGalleryPageProps) {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "573001234567";

  const getWhatsAppUrl = (itemName: string) => {
    const msg = encodeURIComponent(
      `¡Hola! Me interesa cotizar ${whatsappIntro}: "${itemName}". ¿Cuánto costaría y en qué tiempo lo entregan?`
    );
    return `https://wa.me/${phoneNumber}?text=${msg}`;
  };

  return (
    <main className="min-h-screen pt-24 pb-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/ideas" className="hover:text-primary transition-colors">Ideas</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{breadcrumb}</span>
        </div>

        {/* Header */}
        <div className="mb-16 animate-slide-up">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-foreground">
            {title} <span className="text-primary">{titleHighlight}</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group bg-card rounded-3xl overflow-hidden apple-shadow hover:apple-shadow-lg transition-all duration-300 hover:-translate-y-1 text-left"
            >
              <div className="relative aspect-square overflow-hidden bg-accent">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-foreground truncate">{item.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xl animate-fade-in"
            onClick={() => setSelectedItem(null)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-2xl bg-card rounded-3xl shadow-2xl shadow-black/[0.12] animate-slide-up overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Close */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-accent hover:bg-accent/80 flex items-center justify-center transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            {/* 3D Viewer or Image Fallback */}
            <div className="p-4 pb-0">
              {selectedItem.modelPath ? (
                <ProductViewerCanvas modelPath={selectedItem.modelPath} />
              ) : (
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-accent">
                  <Image
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    fill
                    className="object-cover"
                    sizes="600px"
                  />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">{selectedItem.name}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{selectedItem.description}</p>
              </div>

              {selectedItem.modelPath && (
                <p className="text-xs text-muted-foreground">
                  🖱️ Arrastra para rotar · Scroll para zoom
                </p>
              )}

              {/* WhatsApp CTA */}
              <a
                href={getWhatsAppUrl(selectedItem.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-14 bg-[#25D366] hover:bg-[#22c55e] text-white text-base font-semibold rounded-2xl transition-all duration-200 active:scale-[0.98]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Cotizar este diseño
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
