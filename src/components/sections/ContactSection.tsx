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
    <section id="contacto" className="theme-dark bg-background text-foreground py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">
            Contacto
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 text-foreground">
            ¿Tienes un <span className="text-primary">proyecto</span>?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
            Cuéntanos tu idea y te contactamos con una propuesta personalizada.
          </p>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-card rounded-3xl p-8 md:p-10 space-y-6 apple-shadow-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Nombre *</Label>
                <Input
                  id="contact-name"
                  required
                  placeholder="Tu nombre completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-accent/60 border-transparent focus:border-primary/30 focus:ring-primary/20 h-11 rounded-xl"
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
                  className="bg-accent/60 border-transparent focus:border-primary/30 focus:ring-primary/20 h-11 rounded-xl"
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
                  className="bg-accent/60 border-transparent focus:border-primary/30 focus:ring-primary/20 h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-service">Tipo de servicio *</Label>
                <Select
                  required
                  value={formData.serviceType}
                  onValueChange={(val) => setFormData({ ...formData, serviceType: val || "" })}
                >
                  <SelectTrigger id="contact-service" className="bg-accent/60 border-transparent h-11 rounded-xl">
                    <SelectValue placeholder="Selecciona un servicio" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-xl apple-shadow-lg">
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
                className="bg-accent/60 border-transparent focus:border-primary/30 focus:ring-primary/20 rounded-xl resize-none"
              />
            </div>

            {/* Status Messages */}
            {status === "success" && (
              <div className="rounded-2xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 p-4 text-green-700 dark:text-green-400 text-sm">
                ✅ ¡Mensaje enviado! Te contactaremos pronto.
              </div>
            )}
            {status === "error" && (
              <div className="rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 text-red-600 dark:text-red-400 text-sm">
                ❌ {errorMsg || "Error al enviar. Intenta de nuevo."}
              </div>
            )}

            <Button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-base font-medium rounded-2xl shadow-none"
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
