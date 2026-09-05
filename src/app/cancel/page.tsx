import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CancelPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center glass rounded-2xl p-10 animate-slide-up">
        <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-amber-400"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-3">
          Pago <span className="text-amber-400">cancelado</span>
        </h1>

        <p className="text-muted-foreground mb-2">
          El proceso de pago fue cancelado. No se realizó ningún cargo.
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          Puedes volver al cotizador para intentar de nuevo o contactarnos si necesitas ayuda.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/#cotizador">
            <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white border-0">
              Volver al cotizador
            </Button>
          </Link>
          <Link href="/#contacto">
            <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10">
              Contactar soporte
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
