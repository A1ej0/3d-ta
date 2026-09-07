import { NextResponse } from "next/server";
import { PRICING } from "@/lib/pricing";
import { generateIntegritySignature, generateReference } from "@/lib/wompi";
import type { Technology } from "@/types";
// import { adminDb } from "@/lib/firebase-admin";

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

    // Validate material exists in pricing dictionary
    const materials = PRICING[technology as Technology] as Record<string, { pricePerCm3: number; label: string }>;
    const materialInfo = materials[material];

    if (!materialInfo) {
      return NextResponse.json(
        { error: "Material inválido para la tecnología seleccionada." },
        { status: 400 }
      );
    }

    // Validate price consistency (volume × pricePerCm3) — prices in COP
    const MIN_ORDER = 20000; // $20,000 COP minimum
    const calculatedPrice = Math.round(volume * materialInfo.pricePerCm3);
    const expectedPrice = Math.max(calculatedPrice, MIN_ORDER);

    // Allow a small tolerance for rounding
    if (Math.abs(expectedPrice - totalPrice) > 100) {
      return NextResponse.json(
        { error: "El precio calculado no coincide. Intenta de nuevo." },
        { status: 400 }
      );
    }

    // Validate Shipping cost
    let expectedShippingCost = 0;
    if (shippingMethod === "bogota") expectedShippingCost = 10000;
    else if (shippingMethod === "nacional") expectedShippingCost = 20000;

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

    // Save pending order metadata to Firestore (keyed by reference)
    // The Wompi webhook will use this to create the final order
    // try {
    //   if (adminDb) {
    //     await adminDb.collection("pending_orders").doc(reference).set({
    //       fileUrl,
    //       fileName,
    //       volume: volume.toString(),
    //       technology,
    //       material,
    //       materialLabel: materialInfo.label,
    //       customerName,
    //       customerEmail,
    //       shippingMethod,
    //       totalAmountCOP,
    //       thumbnailUrl: thumbnailUrl || "",
    //       userId: userId || "",
    //       userPhone: userPhone || "",
    //       createdAt: new Date(),
    //     });
    //     console.log(`Pending order saved for reference: ${reference}`);
    //   } else {
    //     console.error("adminDb is null. Could not save pending order.");
    //   }
    // } catch (err) {
    //   console.error("Error saving pending order to Firestore:", err);
    //   // Don't fail the checkout if Firestore save fails
    // }

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
