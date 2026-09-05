import HeroSection from "@/components/sections/HeroSection";
import ServicesSection from "@/components/sections/ServicesSection";
import GallerySection from "@/components/sections/GallerySection";
import QuoterSection from "@/components/sections/QuoterSection";
import ContactSection from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <main className="flex-1">
      <HeroSection />
      <ServicesSection />
      <GallerySection />
      <QuoterSection />
      <ContactSection />
    </main>
  );
}
