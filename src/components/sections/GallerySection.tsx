"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

// Duplicamos las imágenes para lograr un scroll infinito fluido
const BASE_IMAGES = Array.from({ length: 15 }, (_, i) => ({
  id: `work-${i + 1}`,
  src: `/gallery/work-${String((i % 20) + 1).padStart(2, "0")}.jpg`,
  alt: `Trabajo de impresión 3D #${i + 1}`,
}));

const GALLERY_IMAGES = [...BASE_IMAGES, ...BASE_IMAGES];

export default function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isHovered = useRef(false);

  // Scroll automático suave continuo (Auto-play)
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isHovered.current && scrollRef.current) {
        scroll("right");
      }
    }, 3500); // Se mueve cada 3.5 segundos

    return () => clearInterval(timer);
  }, []);

  const handleMouseEnter = () => { isHovered.current = true; };
  const handleMouseLeave = () => { isHovered.current = false; };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const { clientWidth } = container;
      
      // Calculamos cuánto scrollear (aprox 1 imagen)
      const scrollAmount = direction === "left" ? -clientWidth / 1.5 : clientWidth / 1.5;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });

      // Verificar límites para crear el efecto infinito (esperar a que termine la animación)
      setTimeout(() => {
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0; // Vuelve al inicio invisiblemente
        } else if (container.scrollLeft <= 0 && direction === "left") {
          container.scrollLeft = container.scrollWidth / 2; // Va al final invisiblemente
        }
      }, 600);
    }
  };

  return (
    <section id="galeria" className="theme-dark bg-background text-foreground py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">
              Portafolio
            </p>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 text-foreground">
              Nuestros <span className="text-primary">trabajos</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Una muestra de los proyectos que hemos realizado para nuestros clientes.
            </p>
          </div>
          
          {/* Carousel Controls */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => scroll("left")}
              className="w-12 h-12 rounded-full bg-card flex items-center justify-center text-foreground hover:bg-accent transition-colors apple-shadow-sm hover:apple-shadow-lg"
              aria-label="Anterior"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-12 h-12 rounded-full bg-card flex items-center justify-center text-foreground hover:bg-accent transition-colors apple-shadow-sm hover:apple-shadow-lg"
              aria-label="Siguiente"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div className="w-full">
        <div 
          ref={scrollRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="flex gap-4 sm:gap-6 overflow-x-auto px-4 sm:px-6 lg:px-8 pb-12 pt-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
        >
          {GALLERY_IMAGES.map((image, idx) => (
            <button
              key={`${image.id}-${idx}`}
              onClick={() => setSelectedImage(image.src)}
              // Tamaños aumentados un ~50%: de 30vw a 45vw en grandes, etc.
              className="group relative flex-none w-[90vw] sm:w-[75vw] md:w-[60vw] lg:w-[45vw] aspect-[4/3] rounded-[2rem] overflow-hidden bg-accent apple-shadow-sm hover:apple-shadow-lg transition-all duration-300 hover:-translate-y-2"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 90vw, (max-width: 1024px) 75vw, 45vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xl animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div className="relative w-[90vw] h-[80vh] max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image
              src={selectedImage}
              alt="Trabajo de impresión 3D ampliado"
              fill
              className="object-contain rounded-2xl"
              sizes="90vw"
            />
          </div>
        </div>
      )}
    </section>
  );
}
