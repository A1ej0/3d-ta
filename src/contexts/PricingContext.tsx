"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
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
    // Fetch pricing configuration from our internal API to bypass Firestore security rules
    const loadPricing = async () => {
      try {
        const res = await fetch("/api/pricing");
        if (res.ok) {
          const data = await res.json();
          if (data.exists) {
            if (data.pricing) setPricing(data.pricing);
            if (data.shippingCosts) setShippingCosts(data.shippingCosts as Record<string, ShippingInfo>);
            if (data.minOrderPrice !== undefined) setMinOrderPrice(data.minOrderPrice);
          }
        }
      } catch (error) {
        console.error("Error loading pricing config via API:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPricing();
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
