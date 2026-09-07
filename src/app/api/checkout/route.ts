import { NextResponse } from "next/server";
import { PRICING } from "@/lib/pricing";
import { generateIntegritySignature, generateReference } from "@/lib/wompi";
import type { Technology } from "@/types";
import { restSetDocument } from "@/lib/firebase-rest";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fileUrl,
      fileName,
      volume,
      technology,
      material,
      totalPrice,
      customerName,
      customerEmail,
      shippingMethod,
      shippingCost,
      thumbnailUrl,
      userId,
      userPhone,
    } = body;

    // Validate required fields
    if (
      !fileUrl || !fileName || !volume || !technology || !material ||
      !totalPrice || !customerName || !customerEmail || !shippingMethod ||
      shippingCost === undefined
    ) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios." },
        { status: 400 }
      );
    }

    // Validate technology exists
    if (!["FDM", "SLA"].includes(technology)) {
      return NextResponse.json(
        { error: "Tecnología inválida." },
        { status: 400 }
      );
    }

    // Fetch dynamic pricing configuration from Firestore
    let dynamicPricing = PRICING;
    let dynamicMinOrder = 20000;
    let dynamicShipping = {
      recogida: { cost: 0 },
      bogota: { cost: 10000 },
      nacional: { cost: 20000 }
    } as any;

    try {
      const { restGetDocument } = await import("@/lib/firebase-rest");
      const settings = await restGetDocument("settings", "pricing");
      if (settings) {
        if (settings.pricing) dynamicPricing = settings.pricing;
        if (settings.minOrderPrice !== undefined) dynamicMinOrder = settings.minOrderPrice;
        if (settings.shippingCosts) dynamicShipping = settings.shippingCosts;
      }
    } catch (e) {
      console.warn("Could not fetch dynamic pricing, falling back to defaults", e);
    }

    // Validate material exists in pricing dictionary
    const materials = dynamicPricing[technology as Technology] as Record<string, { pricePerCm3: number; label: string }>;
    const materialInfo = materials?.[material];

    if (!materialInfo) {
      return NextResponse.json(
        { error: "Material inválido para la tecnología seleccionada." },
        { status: 400 }
      );
    }

    // Validate price consistency (volume × pricePerCm3) — prices in COP
    const calculatedPrice = Math.round(volume * materialInfo.pricePerCm3);
    const expectedPrice = Math.max(calculatedPrice, dynamicMinOrder);

    // Allow a small tolerance for rounding
    if (Math.abs(expectedPrice - totalPrice) > 100) {
      return NextResponse.json(
        { error: "El precio calculado no coincide. Intenta de nuevo." },
        { status: 400 }
      );
    }

    // Validate Shipping cost
    const expectedShippingCost = dynamicShipping[shippingMethod]?.cost || 0;

    if (shippingCost !== expectedShippingCost) {
      return NextResponse.json(
        { error: "Costo de envío inválido." },
        { status: 400 }
      );
    }

    // Total amount in COP (not cents yet)
    const totalAmountCOP = expectedPrice + expectedShippingCost;
    // Wompi expects amount in CENTS (centavos)
    const amountInCents = totalAmountCOP * 100;

    // Generate unique reference
    const reference = generateReference();

    // Generate integrity signature
    const signature = generateIntegritySignature(reference, amountInCents);

    // Save pending order metadata to Firestore (keyed by reference) using REST API
    try {
      await restSetDocument("pending_orders", reference, {
        fileUrl,
        fileName,
        volume: volume.toString(),
        technology,
        material,
        materialLabel: materialInfo.label,
        customerName,
        customerEmail,
        shippingMethod,
        totalAmountCOP,
        thumbnailUrl: thumbnailUrl || "",
        userId: userId || "",
        userPhone: userPhone || "",
        createdAt: new Date(),
      });
      console.log(`Pending order saved for reference: ${reference}`);
    } catch (err) {
      console.error("Error saving pending order via REST:", err);
    }

    return NextResponse.json({
      reference,
      amountInCents,
      currency: "COP",
      signature,
      publicKey: process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL?.replace("localhost", "lvh.me") || "http://lvh.me:3000"}/success`,
    });
    return NextResponse.json({
      reference,
      amountInCents,
      currency: "COP",
      signature,
      publicKey: process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL?.replace("localhost", "lvh.me") || "http://lvh.me:3000"}/success`,
    });
  } catch (error: any) {
    console.error("Checkout error detailed:", error);
    return NextResponse.json(
      { 
        error: "Error interno en el servidor al procesar el checkout.", 
        details: error?.message || String(error)
      },
      { status: 500 }
    );
  }
}
