"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

const GALLERY_IMAGES = Array.from({ length: 20 }, (_, i) => ({
  src: `/gallery/work-${String(i + 1).padStart(2, "0")}.jpg`,
  alt: `Trabajo de impresión 3D #${i + 1}`,
}));

export default function GallerySection() {
  const [visibleCount, setVisibleCount] = useState(8);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const visibleImages = GALLERY_IMAGES.slice(0, visibleCount);
  const hasMore = visibleCount < GALLERY_IMAGES.length;

  return (
    <section id="galeria" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-purple-500/30 text-purple-400">
            Portafolio
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Nuestros <span className="gradient-text">trabajos</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Una muestra de los proyectos que hemos realizado para nuestros clientes.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {visibleImages.map((image, idx) => (
            <button
              key={image.src}
              onClick={() => setSelectedImage(image.src)}
              className="group relative aspect-square rounded-xl overflow-hidden glass animate-fade-in"
              style={{ animationDelay: `${(idx % 8) * 0.05}s` }}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-xs text-white/80 font-medium">
                  Proyecto #{idx + 1}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="text-center mt-10">
            <button
              onClick={() => setVisibleCount((prev) => Math.min(prev + 8, GALLERY_IMAGES.length))}
              className="px-6 py-3 rounded-xl glass text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-all duration-300"
            >
              Ver más trabajos ({GALLERY_IMAGES.length - visibleCount} restantes)
            </button>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:bg-white/10 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div className="relative w-[90vw] h-[80vh] max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <Image
              src={selectedImage}
              alt="Trabajo de impresión 3D ampliado"
              fill
              className="object-contain rounded-xl"
              sizes="90vw"
            />
          </div>
        </div>
      )}
    </section>
  );
}
