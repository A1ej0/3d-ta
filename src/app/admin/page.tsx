"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, orderBy, getDocs, doc, updateDoc, where, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PricingProvider } from "@/contexts/PricingContext";
import PricingConfigPanel from "@/components/admin/PricingConfigPanel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Order, OrderStatus, UserProfile } from "@/types";
import { useRouter } from "next/navigation";

const formatCOP = (value: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(value);

const STATUS_OPTIONS: OrderStatus[] = ["Recibido", "En procesamiento", "Impreso", "Enviado", "Entregado"];

const STATUS_COLORS: Record<string, string> = {
  "Recibido": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "En procesamiento": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Impreso": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "Enviado": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "Entregado": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

const DELIVERY_COLORS: Record<string, string> = {
  "Personal": "bg-white/10 text-foreground",
  "Local": "bg-blue-500/15 text-blue-400",
  "Nacional": "bg-purple-500/15 text-purple-400",
};

const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || "";

export default function AdminPage() {
  const { user, isAdmin, isSuperAdmin, loading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"pedidos" | "roles" | "configuracion">("pedidos");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [savingOrder, setSavingOrder] = useState<string | null>(null);

  // Role management
  const [searchEmail, setSearchEmail] = useState("");
  const [foundUser, setFoundUser] = useState<UserProfile | null>(null);
  const [searchingUser, setSearchingUser] = useState(false);
  const [roleChangeLoading, setRoleChangeLoading] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/");
    }
  }, [loading, user, isAdmin, router]);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
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
  }, []);

  useEffect(() => {
    if (isAdmin && activeTab === "pedidos") {
      fetchOrders();
    }
  }, [isAdmin, activeTab, fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setSavingOrder(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (error) {
      console.error("Error updating order status:", error);
    }
    setSavingOrder(null);
  };

  const handleSaveNotes = async (orderId: string) => {
    setSavingOrder(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), {
        adminNotes: editingNotes[orderId] || "",
        updatedAt: serverTimestamp(),
      });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, adminNotes: editingNotes[orderId] || "" } : o
        )
      );
    } catch (error) {
      console.error("Error saving notes:", error);
    }
    setSavingOrder(null);
  };

  const handleSearchUser = async () => {
    if (!searchEmail.trim()) return;
    setSearchingUser(true);
    setFoundUser(null);
    try {
      const q = query(collection(db, "users"), where("email", "==", searchEmail.trim().toLowerCase()));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setFoundUser({
          uid: data.uid,
          email: data.email,
          displayName: data.displayName,
          photoURL: data.photoURL,
          phone: data.phone || "",
          role: data.role || "user",
          createdAt: data.createdAt?.toDate?.() || new Date(),
        });
      } else {
        setFoundUser(null);
        alert("No se encontró un usuario con ese email.");
      }
    } catch (error) {
      console.error("Error searching user:", error);
    }
    setSearchingUser(false);
  };

  const handleRoleChange = async (newRole: "user" | "admin") => {
    if (!foundUser) return;
    // Protect super admin
    if (foundUser.email === SUPER_ADMIN_EMAIL) return;

    setRoleChangeLoading(true);
    try {
      await updateDoc(doc(db, "users", foundUser.uid), { role: newRole });
      setFoundUser({ ...foundUser, role: newRole });
    } catch (error) {
      console.error("Error changing role:", error);
    }
    setRoleChangeLoading(false);
  };

  if (loading || !isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            Panel de <span className="gradient-text">Administración</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSuperAdmin ? "Súper Administrador" : "Administrador"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 glass rounded-xl w-fit mb-8">
          <button
            onClick={() => setActiveTab("pedidos")}
            className={`py-2 px-6 rounded-lg text-sm font-medium transition-all ${
              activeTab === "pedidos"
                ? "bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-foreground border border-white/10"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Pedidos Activos
          </button>
          <button
            onClick={() => setActiveTab("configuracion")}
            className={`py-2 px-6 rounded-lg text-sm font-medium transition-all ${
              activeTab === "configuracion"
                ? "bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-foreground border border-white/10"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Configuración
          </button>
          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab("roles")}
              className={`py-2 px-6 rounded-lg text-sm font-medium transition-all ${
                activeTab === "roles"
                  ? "bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-foreground border border-white/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Gestión de Roles
            </button>
          )}
        </div>

        {/* Configuracion Tab */}
        {activeTab === "configuracion" && (
          <PricingProvider>
            <PricingConfigPanel />
          </PricingProvider>
        )}

        {/* Orders Tab */}
        {activeTab === "pedidos" && (
          <div className="animate-slide-up">
            {loadingOrders ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
              </div>
            ) : orders.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <p className="text-muted-foreground">No hay pedidos registrados.</p>
              </div>
            ) : (
              <div className="glass rounded-2xl overflow-hidden">
                {/* Table Header */}
                <div className="hidden lg:grid grid-cols-[1fr_130px_80px_100px_130px_60px] gap-3 px-5 py-3 bg-white/5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <span>Cliente</span>
                  <span>Teléfono</span>
                  <span>Drive</span>
                  <span>Entrega</span>
                  <span>Estado</span>
                  <span></span>
                </div>

                {/* Table Rows */}
                {orders.map((order) => (
                  <div key={order.id} className="border-t border-white/5">
                    {/* Main Row */}
                    <div
                      className={`grid lg:grid-cols-[1fr_130px_80px_100px_130px_60px] gap-3 px-5 py-4 items-center cursor-pointer hover:bg-white/[0.02] transition-colors ${
                        expandedOrder === order.id ? "bg-white/[0.03]" : ""
                      }`}
                      onClick={() => {
                        const newExpanded = expandedOrder === order.id ? null : order.id!;
                        setExpandedOrder(newExpanded);
                        if (newExpanded && !editingNotes[order.id!]) {
                          setEditingNotes((prev) => ({ ...prev, [order.id!]: order.adminNotes || "" }));
                        }
                      }}
                    >
                      {/* Client */}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{order.userEmail}</p>
                        <p className="text-xs text-muted-foreground truncate lg:hidden">
                          {order.fileName} · {formatCOP(order.totalPrice)}
                        </p>
                      </div>

                      {/* Phone */}
                      <div>
                        {order.userPhone ? (
                          <a
                            href={`https://wa.me/${order.userPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                            {order.userPhone}
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>

                      {/* Drive Link */}
                      <div>
                        {order.driveUrl ? (
                          <a
                            href={order.driveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-cyan-400 hover:text-cyan-300 transition-colors"
                            title="Ver archivo en Drive"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>

                      {/* Delivery */}
                      <div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${DELIVERY_COLORS[order.deliveryType] || "bg-white/10"}`}>
                          {order.deliveryType}
                        </span>
                      </div>

                      {/* Status */}
                      <div>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status] || ""}`}>
                          {order.status}
                        </span>
                      </div>

                      {/* Expand Arrow */}
                      <div className="flex justify-end">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className={`text-muted-foreground transition-transform ${expandedOrder === order.id ? "rotate-180" : ""}`}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </div>

                    {/* Expanded Detail */}
                    {expandedOrder === order.id && (
                      <div className="px-5 pb-5 bg-white/[0.02] border-t border-white/5 animate-slide-up">
                        <div className="grid gap-4 sm:grid-cols-2 pt-4">
                          {/* Left: Order details */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              {order.thumbnailUrl && (
                                <img src={order.thumbnailUrl} alt="" className="w-16 h-16 rounded-lg object-cover bg-white/5" />
                              )}
                              <div>
                                <p className="text-sm font-semibold">{order.fileName}</p>
                                <p className="text-xs text-muted-foreground">Ref: {order.reference}</p>
                                <p className="text-sm font-bold gradient-text mt-1">{formatCOP(order.totalPrice)}</p>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <p><span className="font-medium text-foreground">Tecnología:</span> {order.technology} — {order.material}</p>
                              <p><span className="font-medium text-foreground">Volumen:</span> {order.volume?.toFixed(2)} cm³</p>
                              <p><span className="font-medium text-foreground">Fecha:</span> {order.createdAt instanceof Date ? order.createdAt.toLocaleString("es-CO") : "—"}</p>
                              {order.shippingAddress && (
                                <p className="mt-2 pt-2 border-t border-white/5"><span className="font-medium text-foreground block mb-0.5">Dirección de envío:</span> {order.shippingAddress}</p>
                              )}
                            </div>
                          </div>

                          {/* Right: Admin controls */}
                          <div className="space-y-3">
                            <div className="space-y-1.5">
                              <Label className="text-xs text-muted-foreground">Cambiar Estado</Label>
                              <Select
                                value={order.status}
                                onValueChange={(val) => handleStatusChange(order.id!, val as OrderStatus)}
                              >
                                <SelectTrigger className="bg-white/5 border-white/10 h-9 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {STATUS_OPTIONS.map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs text-muted-foreground">Notas del administrador</Label>
                              <textarea
                                value={editingNotes[order.id!] ?? order.adminNotes ?? ""}
                                onChange={(e) => setEditingNotes((prev) => ({ ...prev, [order.id!]: e.target.value }))}
                                placeholder="Notas internas sobre el pedido..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSaveNotes(order.id!)}
                                disabled={savingOrder === order.id}
                                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white border-0 text-xs"
                              >
                                {savingOrder === order.id ? "Guardando..." : "Guardar Notas"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Roles Tab */}
        {activeTab === "roles" && isSuperAdmin && (
          <div className="animate-slide-up">
            <div className="glass rounded-2xl p-6 md:p-8 max-w-lg mx-auto space-y-6">
              <h2 className="text-lg font-semibold">Gestión de Roles</h2>
              <p className="text-sm text-muted-foreground">
                Busca un usuario por email para cambiar su rol.
              </p>

              <div className="flex gap-2">
                <Input
                  placeholder="usuario@email.com"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchUser()}
                  className="bg-white/5 border-white/10 h-10 text-sm flex-1"
                />
                <Button
                  onClick={handleSearchUser}
                  disabled={searchingUser}
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white border-0 h-10"
                >
                  {searchingUser ? "Buscando..." : "Buscar"}
                </Button>
              </div>

              {/* Found user card */}
              {foundUser && (
                <div className="bg-white/5 rounded-xl p-5 space-y-4 border border-white/10">
                  <div className="flex items-center gap-3">
                    {foundUser.photoURL ? (
                      <img src={foundUser.photoURL} alt="" className="w-12 h-12 rounded-full" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-lg font-bold">
                        {(foundUser.displayName || foundUser.email)[0].toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{foundUser.displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{foundUser.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Rol actual</p>
                      <p className="text-sm font-semibold capitalize">{foundUser.role}</p>
                    </div>

                    {foundUser.email === SUPER_ADMIN_EMAIL ? (
                      <p className="text-xs text-yellow-400 bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20">
                        🔒 Súper Admin protegido
                      </p>
                    ) : (
                      <div className="flex gap-2">
                        {foundUser.role !== "admin" ? (
                          <Button
                            size="sm"
                            onClick={() => handleRoleChange("admin")}
                            disabled={roleChangeLoading}
                            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white border-0 text-xs"
                          >
                            Hacer Admin
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRoleChange("user")}
                            disabled={roleChangeLoading}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs"
                          >
                            Quitar Admin
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
