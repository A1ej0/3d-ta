"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Inicio", href: "#inicio" },
  { label: "Servicios", href: "#servicios" },
  { label: "Galería", href: "#galeria" },
  { label: "Cotizador", href: "#cotizador" },
  { label: "Contacto", href: "#contacto" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, userProfile, isAdmin, loading, signInWithGoogle, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavClick = (href: string) => {
    setOpen(false);
    setDropdownOpen(false);
    // If we're on a subpage, navigate to home first
    if (window.location.pathname !== "/") {
      window.location.href = "/" + href;
      return;
    }
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 theme-light bg-white/60 backdrop-blur-2xl border-b border-black/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 md:h-[52px]">
          {/* Logo - Left */}
          <div className="flex-1 flex justify-start">
            <button
              onClick={() => handleNavClick("#inicio")}
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xs transition-transform group-hover:scale-105">
                3D
              </div>
              <span className="text-lg font-semibold text-foreground">3D-Ta</span>
            </button>
          </div>

          {/* Desktop Links - Center */}
          <div className="hidden md:flex flex-1 items-center justify-center gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="px-3 py-1.5 text-xs font-medium text-foreground/70 hover:text-foreground transition-colors rounded-full hover:bg-foreground/[0.04]"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Auth Section - Right */}
          <div className="hidden md:flex flex-1 items-center justify-end gap-2">
            <Button
              size="sm"
              onClick={() => handleNavClick("#cotizador")}
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-4 h-7 text-xs font-medium shadow-none"
            >
              Cotizar Ahora
            </Button>
            {!loading && (
              <>
                {user ? (
                  <div className="relative ml-2" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-200"
                    >
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || "Avatar"}
                          className="w-7 h-7 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                          {(user.displayName || user.email || "U")[0].toUpperCase()}
                        </div>
                      )}
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-card rounded-2xl border border-border shadow-xl shadow-black/[0.08] py-1.5 animate-slide-up">
                        <div className="px-4 py-2.5 border-b border-border">
                          <p className="text-sm font-semibold text-card-foreground truncate">{user.displayName}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <Link
                          href="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          Mi Perfil
                        </Link>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                            Panel Admin
                          </Link>
                        )}
                        <div className="border-t border-border my-1" />
                        <button
                          onClick={() => { signOut(); setDropdownOpen(false); }}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                          Cerrar sesión
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={signInWithGoogle}
                    className="ml-1 text-muted-foreground hover:text-foreground rounded-full gap-2 text-xs"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Iniciar sesión
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile avatar */}
            {!loading && user && (
              <Link href="/dashboard" className="ring-2 ring-primary/20 rounded-full">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                    {(user.displayName || "U")[0].toUpperCase()}
                  </div>
                )}
              </Link>
            )}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-foreground rounded-full"
                  />
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
              </SheetTrigger>
              <SheetContent side="right" className="bg-card border-border w-72">
                <SheetTitle className="text-foreground text-lg font-semibold">
                  3D-Ta
                </SheetTitle>
                <nav className="flex flex-col gap-1 mt-8">
                  {NAV_LINKS.map((link) => (
                    <button
                      key={link.href}
                      onClick={() => handleNavClick(link.href)}
                      className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-accent"
                    >
                      {link.label}
                    </button>
                  ))}
                  <Button
                    onClick={() => handleNavClick("#cotizador")}
                    className="mt-4 bg-primary hover:bg-primary/90 text-white rounded-2xl h-11 shadow-none"
                  >
                    Cotizar Ahora
                  </Button>

                  {/* Mobile auth section */}
                  {!loading && (
                    <div className="mt-4 pt-4 border-t border-border space-y-2">
                      {user ? (
                        <>
                          <div className="flex items-center gap-3 px-4 py-2">
                            {user.photoURL && (
                              <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate">{user.displayName}</p>
                              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                          </div>
                          <Link
                            href="/dashboard"
                            onClick={() => setOpen(false)}
                            className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-colors"
                          >
                            Mi Perfil
                          </Link>
                          {isAdmin && (
                            <Link
                              href="/admin"
                              onClick={() => setOpen(false)}
                              className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-colors"
                            >
                              Panel Admin
                            </Link>
                          )}
                          <button
                            onClick={() => { signOut(); setOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 rounded-xl transition-colors"
                          >
                            Cerrar sesión
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => { signInWithGoogle(); setOpen(false); }}
                          className="flex items-center gap-2 w-full px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                          Iniciar sesión con Google
                        </button>
                      )}
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
