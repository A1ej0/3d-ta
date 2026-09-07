import { NextResponse } from "next/server";
import { restSetDocument } from "@/lib/firebase-rest";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request structure (basic)
    if (!body.pricing || !body.shippingCosts || body.minOrderPrice === undefined) {
      return NextResponse.json({ error: "Datos de configuración incompletos." }, { status: 400 });
    }

    // Save to Firestore using REST API to bypass client security rules
    await restSetDocument("settings", "pricing", {
      pricing: body.pricing,
      shippingCosts: body.shippingCosts,
      minOrderPrice: body.minOrderPrice,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error saving pricing config:", error);
    return NextResponse.json(
      { error: "Error interno al guardar la configuración.", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
