import { Separator } from "@/components/ui/separator";

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "#",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: process.env.NEXT_PUBLIC_FACEBOOK_URL || "#",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: process.env.NEXT_PUBLIC_TIKTOK_URL || "#",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.92 2.92 0 0 1 .88.13v-3.5a6.37 6.37 0 0 0-.88-.07 6.34 6.34 0 0 0 0 12.68 6.34 6.34 0 0 0 6.34-6.34V9.05a8.27 8.27 0 0 0 3.76.97V6.69z"/>
      </svg>
    ),
  },
];

const NAV_LINKS = [
  { label: "Inicio", href: "#inicio" },
  { label: "Servicios", href: "#servicios" },
  { label: "Galería", href: "#galeria" },
  { label: "Cotizador", href: "#cotizador" },
  { label: "Contacto", href: "#contacto" },
];

export default function Footer() {
  return (
    <footer className="theme-light border-t border-border bg-card text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xs">
                3D
              </div>
              <span className="text-lg font-semibold text-foreground">3D-Ta</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Servicios profesionales de impresión 3D, modelado y escáner.
              Transformamos tus ideas en realidad con tecnología de punta.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              Navegación
            </h3>
            <nav className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              Síguenos
            </h3>
            <div className="flex gap-2">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/[0.08] transition-all duration-200"
                >
                  {social.icon}
                </a>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              📧 {process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contacto@3d-ta.com"}
            </p>
          </div>
        </div>

        <Separator className="my-8 bg-border" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} 3D-Ta. Todos los derechos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            Hecho con 💙 y tecnología 3D
          </p>
        </div>
      </div>
    </footer>
  );
}
