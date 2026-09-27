"use client";

import ProductGalleryPage from "@/components/ideas/ProductGalleryPage";
import type { GalleryItem } from "@/components/ideas/ProductGalleryPage";

const KEYCAP_ITEMS: GalleryItem[] = [
  {
    id: "kc-1",
    name: "Dragon Keycap",
    description: "Keycap artesanal con diseño de dragón tallado en resina de alta resolución. Compatible con switches Cherry MX.",
    image: "/ideas/keycaps/keycap-01.jpg",
    modelPath: "/models/keycaps/keycap-01.glb",
  },
  {
    id: "kc-2",
    name: "Mountain Keycap",
    description: "Paisaje montañoso en miniatura sobre tu tecla. Perfecto para Esc o teclas especiales.",
    image: "/ideas/keycaps/keycap-02.jpg",
    modelPath: "/models/keycaps/keycap-02.glb",
  },
  {
    id: "kc-3",
    name: "Coral Reef",
    description: "Arrecife de coral con texturas orgánicas. Impreso en resina translúcida con acabado UV.",
    image: "/ideas/keycaps/keycap-03.jpg",
  },
  {
    id: "kc-4",
    name: "Skull Keycap",
    description: "Calavera estilizada con detalles finos. Disponible en múltiples colores y acabados.",
    image: "/ideas/keycaps/keycap-04.jpg",
  },
  {
    id: "kc-5",
    name: "Sakura Blossom",
    description: "Flor de cerezo japonés con pétalos delicados. Pintada a mano sobre resina SLA.",
    image: "/ideas/keycaps/keycap-05.jpg",
  },
  {
    id: "kc-6",
    name: "Cyberpunk City",
    description: "Ciudad futurista en miniatura con luces neón. Un keycap que es una obra de arte.",
    image: "/ideas/keycaps/keycap-06.jpg",
  },
  {
    id: "kc-7",
    name: "Ocean Wave",
    description: "Ola oceánica congelada en resina transparente azul. Efecto de profundidad 3D.",
    image: "/ideas/keycaps/keycap-07.jpg",
  },
  {
    id: "kc-8",
    name: "Mushroom Forest",
    description: "Bosque de hongos mágicos en miniatura. Colores vibrantes y texturas realistas.",
    image: "/ideas/keycaps/keycap-08.jpg",
  },
];

export default function KeycapsPage() {
  return (
    <ProductGalleryPage
      title="Keycaps"
      titleHighlight="Custom"
      subtitle="Teclas artesanales para tu teclado mecánico. Cada keycap es una pieza única impresa en resina de alta resolución."
      breadcrumb="Keycaps"
      items={KEYCAP_ITEMS}
      whatsappIntro="un keycap personalizado"
    />
  );
}
