"use client";

import ProductGalleryPage from "@/components/ideas/ProductGalleryPage";
import type { GalleryItem } from "@/components/ideas/ProductGalleryPage";

const MATERA_ITEMS: GalleryItem[] = [
  {
    id: "mt-1",
    name: "Geodésica Low-Poly",
    description: "Matera con forma geométrica facetada. Ideal para suculentas pequeñas. Incluye orificio de drenaje.",
    image: "/ideas/materas/matera-01.jpg",
    modelPath: "/models/materas/matera-01.glb",
  },
  {
    id: "mt-2",
    name: "Espiral Orgánica",
    description: "Diseño inspirado en formas orgánicas con textura espiral continua. Perfecta como centro de mesa.",
    image: "/ideas/materas/matera-02.jpg",
    modelPath: "/models/materas/matera-02.glb",
  },
  {
    id: "mt-3",
    name: "Cubismo Abstracto",
    description: "Matera con formas cubistas superpuestas. Un toque artístico para cualquier espacio.",
    image: "/ideas/materas/matera-03.jpg",
  },
  {
    id: "mt-4",
    name: "Rostro Griego",
    description: "Matera en forma de busto griego clásico. Impresa en PLA con acabado mate elegante.",
    image: "/ideas/materas/matera-04.jpg",
  },
  {
    id: "mt-5",
    name: "Zigzag Moderno",
    description: "Diseño minimalista con patrón en zigzag. Disponible en múltiples tamaños y colores.",
    image: "/ideas/materas/matera-05.jpg",
  },
  {
    id: "mt-6",
    name: "Cactus Holder",
    description: "Matera con forma de cactus para poner un cactus real. Meta-diseño divertido y original.",
    image: "/ideas/materas/matera-06.jpg",
  },
  {
    id: "mt-7",
    name: "Hexagonal Stack",
    description: "Sistema modular de materas hexagonales apilables. Crea tu propia composición verde.",
    image: "/ideas/materas/matera-07.jpg",
  },
  {
    id: "mt-8",
    name: "Onda Marina",
    description: "Matera con textura ondulada inspirada en el mar. Acabado suave con degradé azul a blanco.",
    image: "/ideas/materas/matera-08.jpg",
  },
];

export default function MaterasPage() {
  return (
    <ProductGalleryPage
      title="Materas"
      titleHighlight="3D"
      subtitle="Macetas con diseños geométricos, orgánicos y artísticos. Cada una impresa en 3D con materiales de alta calidad."
      breadcrumb="Materas"
      items={MATERA_ITEMS}
      whatsappIntro="una matera 3D"
    />
  );
}
