// ===== Pricing Types =====
export type Technology = "FDM" | "SLA";

export type FDMMaterial = "PLA" | "ABS" | "PETG";
export type SLAMaterial = "STANDARD" | "TOUGH";
export type Material = FDMMaterial | SLAMaterial;

export interface MaterialInfo {
  pricePerCm3: number;
  label: string;
  description: string;
  color: string;
}

export type MaterialMap<T extends string> = Record<T, MaterialInfo>;

export interface PricingConfig {
  FDM: MaterialMap<FDMMaterial>;
  SLA: MaterialMap<SLAMaterial>;
}

// ===== Quoter State =====
export interface QuoterState {
  file: File | null;
  fileName: string;
  geometry: unknown | null;
  volume: number; // cm³
  dimensions: { x: number; y: number; z: number } | null;
  technology: Technology;
  material: Material;
  isLoading: boolean;
  error: string | null;
}

// ===== Contact Form =====
export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  message: string;
}

// ===== Checkout =====
export interface CheckoutPayload {
  fileUrl: string;
  fileName: string;
  volume: number;
  technology: Technology;
  material: Material;
  totalPrice: number;
  customerName: string;
  customerEmail: string;
  shippingMethod: string;
  shippingCost: number;
}

// ===== Order Notification =====
export interface OrderData {
  customerName: string;
  customerEmail: string;
  technology: Technology;
  material: string;
  volume: number;
  totalPrice: number;
  fileUrl: string;
}

// ===== Gallery =====
export interface GalleryImage {
  src: string;
  alt: string;
}

// ===== Service =====
export interface ServiceCard {
  title: string;
  description: string;
  icon: string;
  features: string[];
  gradient: string;
}

// ===== User Profile (Firestore) =====
export type UserRole = "user" | "admin" | "superadmin";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  phone: string;
  role: UserRole;
  createdAt: Date;
}

// ===== Order (Firestore) =====
export type OrderStatus = "Recibido" | "En procesamiento" | "Impreso" | "Enviado" | "Entregado";
export type DeliveryType = "Personal" | "Local" | "Nacional";

export interface Order {
  id?: string;
  userId: string;
  userEmail: string;
  userPhone: string;
  reference: string;
  driveUrl: string;
  thumbnailUrl: string;
  fileName: string;
  technology: Technology;
  material: string;
  volume: number;
  totalPrice: number;
  deliveryType: DeliveryType;
  status: OrderStatus;
  adminNotes: string;
  createdAt: Date;
  updatedAt: Date;
}
