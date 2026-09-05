"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const SERVICE_OPTIONS = [
  { value: "impresion-3d", label: "Impresión 3D" },
  { value: "modelado-3d", label: "Modelado 3D" },
  { value: "escaneo-3d", label: "Escáner 3D" },
  { value: "proyecto-completo", label: "Proyecto completo" },
  { value: "otro", label: "Otro" },
];

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    serviceType: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al enviar el formulario");
      }

      setStatus("success");
      setFormData({ name: "", email: "", phone: "", serviceType: "", message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  return (
    <section id="contacto" className="py-24 relative">
      <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-gradient-radial from-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-emerald-500/30 text-emerald-400">
            Contacto
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            ¿Tienes un <span className="gradient-text">proyecto</span>?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Cuéntanos tu idea y te contactamos con una propuesta personalizada.
          </p>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Nombre *</Label>
                <Input
                  id="contact-name"
                  required
                  placeholder="Tu nombre completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white/5 border-white/10 focus:border-cyan-500/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email *</Label>
                <Input
                  id="contact-email"
                  type="email"
                  required
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white/5 border-white/10 focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contact-phone">Teléfono</Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  placeholder="+57 300 123 4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-white/5 border-white/10 focus:border-cyan-500/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-service">Tipo de servicio *</Label>
                <Select
                  required
                  value={formData.serviceType}
                  onValueChange={(val) => setFormData({ ...formData, serviceType: val || "" })}
                >
                  <SelectTrigger id="contact-service" className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Selecciona un servicio" />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-white/10">
                    {SERVICE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-message">Mensaje *</Label>
              <Textarea
                id="contact-message"
                required
                rows={5}
                placeholder="Describe tu proyecto, incluye detalles como dimensiones, material preferido, cantidad, etc."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="bg-white/5 border-white/10 focus:border-cyan-500/50 resize-none"
              />
            </div>

            {/* Status Messages */}
            {status === "success" && (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-emerald-400 text-sm">
                ✅ ¡Mensaje enviado! Te contactaremos pronto.
              </div>
            )}
            {status === "error" && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">
                ❌ {errorMsg || "Error al enviar. Intenta de nuevo."}
              </div>
            )}

            <Button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white border-0 h-12 text-base shadow-lg shadow-cyan-500/20"
            >
              {status === "loading" ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Enviando...
                </span>
              ) : (
                "Enviar mensaje"
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
