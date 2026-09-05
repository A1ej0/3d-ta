import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "3D-Ta | Impresión 3D, Modelado y Escáner Profesional",
  description:
    "Servicios profesionales de impresión 3D (FDM y SLA), modelado 3D y escaneo. Cotiza tu proyecto al instante con nuestro cotizador automático. Calidad y precisión garantizada.",
  keywords: [
    "impresión 3D",
    "modelado 3D",
    "escáner 3D",
    "FDM",
    "SLA",
    "prototipado",
    "cotizador 3D",
    "3D-Ta",
  ],
  openGraph: {
    title: "3D-Ta | Impresión 3D, Modelado y Escáner Profesional",
    description:
      "Transformamos tus ideas en realidad con tecnología 3D de punta. Cotiza al instante.",
    type: "website",
    locale: "es_CO",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <head>
        <script src="https://checkout.wompi.co/widget.js" async />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Navbar />
        {children}
        <Footer />
        <WhatsAppFAB />
      </body>
    </html>
  );
}
