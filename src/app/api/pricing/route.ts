import { NextResponse } from "next/server";
import { restGetDocument } from "@/lib/firebase-rest";

// Optional: Add cache headers if pricing doesn't change often, 
// but for an admin it's better to fetch fresh. We'll disable caching.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await restGetDocument("settings", "pricing");
    
    if (!settings) {
      // If it doesn't exist yet, return a 404-like response or empty object
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({
      exists: true,
      pricing: settings.pricing,
      shippingCosts: settings.shippingCosts,
      minOrderPrice: settings.minOrderPrice,
    });
  } catch (error: any) {
    console.error("Error fetching pricing config via REST:", error);
    return NextResponse.json(
      { error: "Error interno al obtener la configuración.", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
