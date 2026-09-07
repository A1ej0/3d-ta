"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PRICING as DEFAULT_PRICING, SHIPPING_COSTS as DEFAULT_SHIPPING_COSTS, MIN_ORDER_PRICE as DEFAULT_MIN_ORDER_PRICE } from "@/lib/pricing";
import type { PricingConfig } from "@/types";
import type { ShippingMethod } from "@/lib/pricing";

type ShippingInfo = { label: string; cost: number; duration?: string; description?: string };

interface PricingContextType {
  pricing: PricingConfig;
  shippingCosts: Record<string, ShippingInfo>;
  minOrderPrice: number;
  loading: boolean;
}

const PricingContext = createContext<PricingContextType>({
  pricing: DEFAULT_PRICING,
  shippingCosts: DEFAULT_SHIPPING_COSTS,
  minOrderPrice: DEFAULT_MIN_ORDER_PRICE,
  loading: true,
});

export function PricingProvider({ children }: { children: React.ReactNode }) {
  const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING);
  const [shippingCosts, setShippingCosts] = useState<Record<string, ShippingInfo>>(DEFAULT_SHIPPING_COSTS);
  const [minOrderPrice, setMinOrderPrice] = useState<number>(DEFAULT_MIN_ORDER_PRICE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to changes in settings/pricing in real-time so any admin updates reflect immediately
    const docRef = doc(db, "settings", "pricing");
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.pricing) setPricing(data.pricing);
        if (data.shippingCosts) setShippingCosts(data.shippingCosts as Record<string, ShippingInfo>);
        if (data.minOrderPrice !== undefined) setMinOrderPrice(data.minOrderPrice);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error loading pricing config:", error);
      // Fall back to defaults on error
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <PricingContext.Provider value={{ pricing, shippingCosts, minOrderPrice, loading }}>
      {children}
    </PricingContext.Provider>
  );
}

export function usePricing() {
  return useContext(PricingContext);
}
