"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, orderBy, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import OrderDetailModal from "@/components/dashboard/OrderDetailModal";
import type { Order } from "@/types";
import { useRouter } from "next/navigation";

const formatCOP = (value: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(value);

const STATUS_COLORS: Record<string, string> = {
  "Recibido": "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  "En procesamiento": "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  "Impreso": "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400",
  "Enviado": "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
  "Entregado": "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
};

export default function DashboardPage() {
  const { user, userProfile, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"perfil" | "pedidos">("perfil");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [loading, user, router]);

  // Set profile data
  useEffect(() => {
    if (userProfile) {
      setPhone(userProfile.phone || "");
      setAddress(userProfile.address || "");
    }
  }, [userProfile]);

  // Fetch orders when tab changes
  useEffect(() => {
    if (activeTab === "pedidos" && user) {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user]);

  const fetchOrders = async () => {
    if (!user) return;
    setLoadingOrders(true);
    try {
      const q = query(
        collection(db, "orders"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const ordersList = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() || new Date(),
        updatedAt: d.data().updatedAt?.toDate?.() || new Date(),
      })) as Order[];
      setOrders(ordersList);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
    setLoadingOrders(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      await updateDoc(doc(db, "users", user.uid), { 
        phone: phone.trim(),
        address: address.trim(),
      });
      await refreshProfile();
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
    setSavingProfile(false);
  };

  if (loading || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 bg-background">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          {user.photoURL && (
            <div className="ring-2 ring-primary/20 rounded-full">
              <img
                src={user.photoURL}
                alt=""
                className="w-16 h-16 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Hola, <span className="text-primary">{user.displayName}</span>
            </h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {/* Tabs — iOS segmented control style */}
        <div className="flex gap-1 p-1 bg-accent rounded-2xl mb-8">
          <button
            onClick={() => setActiveTab("perfil")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === "perfil"
                ? "bg-card text-foreground apple-shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Mi Perfil
          </button>
          <button
            onClick={() => setActiveTab("pedidos")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === "pedidos"
                ? "bg-card text-foreground apple-shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Mis Pedidos
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === "perfil" && (
          <div className="bg-card rounded-3xl p-6 md:p-8 space-y-6 apple-shadow animate-slide-up">
            <h2 className="text-lg font-semibold text-foreground">Información Personal</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Nombre</Label>
                <Input
                  value={user.displayName || ""}
                  disabled
                  className="bg-accent/60 border-transparent h-11 text-sm opacity-60 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Email</Label>
                <Input
                  value={user.email || ""}
                  disabled
                  className="bg-accent/60 border-transparent h-11 text-sm opacity-60 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs text-muted-foreground">
                Teléfono / WhatsApp
              </Label>
              <div className="flex gap-2">
                <Input
                  id="phone"
                  placeholder="573001234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-accent/60 border-transparent h-11 text-sm flex-1 rounded-xl focus:border-primary/30 focus:ring-primary/20"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Incluye el código de país (ej: 573001234567)
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs text-muted-foreground">
                Dirección de envío por defecto
              </Label>
              <Textarea
                id="address"
                placeholder="Ej: Calle 123 # 45-67, Apto 802, Conjunto Los Pinos, Bogotá. (Incluir barrio e indicaciones)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="bg-accent/60 border-transparent text-sm min-h-[80px] rounded-xl focus:border-primary/30 focus:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground">
                Se autocompletará automáticamente en tus futuras compras.
              </p>
            </div>

            <div className="pt-2">
              <Button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="bg-primary hover:bg-primary/90 text-white h-11 w-full sm:w-auto px-8 rounded-2xl shadow-none"
              >
                {savingProfile ? "Guardando..." : profileSaved ? "✓ Guardado" : "Guardar Cambios"}
              </Button>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "pedidos" && (
          <div className="animate-slide-up">
            {loadingOrders ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-card rounded-3xl p-12 text-center apple-shadow">
                <div className="w-16 h-16 rounded-2xl bg-primary/[0.08] flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">Sin pedidos aún</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Cuando realices una compra, tus pedidos aparecerán aquí.
                </p>
                <Button
                  onClick={() => router.push("/#cotizador")}
                  className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 shadow-none"
                >
                  Ir al Cotizador
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {orders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="bg-card rounded-2xl p-5 text-left hover:scale-[1.01] transition-all duration-200 group apple-shadow hover:apple-shadow-lg"
                  >
                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      <div className="w-16 h-16 rounded-xl bg-accent flex-shrink-0 overflow-hidden">
                        {order.thumbnailUrl ? (
                          <img src={order.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate mb-1 text-foreground">{order.fileName}</p>
                        <p className="text-xs text-muted-foreground mb-2">
                          Ref: {order.reference}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status] || "bg-accent text-muted-foreground"}`}>
                            {order.status}
                          </span>
                          <span className="text-sm font-bold text-primary">
                            {formatCOP(order.totalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </div>
    </main>
  );
}
