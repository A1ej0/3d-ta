import { NextResponse } from "next/server";
import { Resend } from "resend";
import { restGetDocument, restAddDocument } from "@/lib/firebase-rest";

// Check if Resend API key is configured
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Map shippingMethod codes to delivery type labels
const SHIPPING_MAP: Record<string, string> = {
  recogida: "Personal",
  bogota: "Local",
  nacional: "Nacional",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Wompi Webhook received:", JSON.stringify(body, null, 2));

    // The webhook payload from Wompi usually contains an "event" and "data" object
    const event = body.event;
    
    // We only care about transaction updates
    if (event !== "transaction.updated") {
      return NextResponse.json({ received: true });
    }

    const transaction = body.data.transaction;
    
    // Extract transaction data
    const status = transaction.status;
    const reference = transaction.reference;
    const amountInCents = transaction.amount_in_cents;
    const paymentMethodType = transaction.payment_method?.type || "Desconocido";
    const customerEmail = transaction.customer_email || "No provisto";
    
    // Validate if the transaction was approved
    if (status === "APPROVED") {
      console.log(`Transaction ${reference} was APPROVED.`);
      
      // Calculate amount in COP (Wompi sends it in cents)
      const amountCOP = amountInCents / 100;
      
      // Format as currency
      const formattedAmount = new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0
      }).format(amountCOP);

      // Try to fetch the order metadata from our checkout endpoint
      // The metadata was embedded in the Wompi transaction reference
      // We look for it in Firestore first, or use the transaction data
      let driveUrl = "";
      let thumbnailUrl = "";
      let fileName = "";
      let technology = "";
      let materialStr = "";
      let volume = 0;
      let deliveryType = "Personal";
      let userId = "";
      let userPhone = "";

      // Check if we already have order metadata stored (from checkout route)
      try {
        const pending = await restGetDocument("pending_orders", reference);
        
        if (pending) {
          driveUrl = pending?.fileUrl || "";
          thumbnailUrl = pending?.thumbnailUrl || "";
          fileName = pending?.fileName || "";
          technology = pending?.technology || "";
          materialStr = pending?.material || "";
          volume = parseFloat(pending?.volume || "0");
          deliveryType = SHIPPING_MAP[pending?.shippingMethod || "recogida"] || "Personal";
          userId = pending?.userId || "";
          userPhone = pending?.userPhone || "";
        }
      } catch (err) {
        console.warn("Could not fetch pending order metadata:", err);
      }

      // Create the order in Firestore
      try {
        const orderData = {
          userId: userId,
          userEmail: customerEmail,
          userPhone: userPhone,
          reference: reference,
          driveUrl: driveUrl,
          thumbnailUrl: thumbnailUrl,
          fileName: fileName,
          technology: technology,
          material: materialStr,
          volume: volume,
          totalPrice: amountCOP,
          deliveryType: deliveryType,
          status: "Recibido",
          adminNotes: "",
          createdAt: new Date(),
          updatedAt: new Date(),
          paymentMethod: paymentMethodType,
        };

        await restAddDocument("orders", orderData);
        console.log(`Order created in Firestore via REST for reference ${reference}`);
      } catch (err) {
        console.error("Error creating order in Firestore via REST:", err);
      }

      const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";

      // Send email notification using Resend
      if (resend) {
        await resend.emails.send({
          from: "3D-TA Notificaciones <onboarding@resend.dev>",
          to: adminEmail,
          subject: `¡Nueva orden pagada! - Ref: ${reference}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #10b981; padding: 20px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 24px;">¡Nueva orden de impresión pagada! 🚀</h1>
              </div>
              <div style="padding: 30px;">
                <p>Se ha confirmado un nuevo pago exitoso a través de Wompi.</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
                  <p style="margin: 5px 0;"><strong>Referencia:</strong> ${reference}</p>
                  <p style="margin: 5px 0;"><strong>Valor pagado:</strong> ${formattedAmount}</p>
                  <p style="margin: 5px 0;"><strong>Correo del cliente:</strong> ${customerEmail}</p>
                  <p style="margin: 5px 0;"><strong>Método de pago:</strong> ${paymentMethodType}</p>
                  ${fileName ? `<p style="margin: 5px 0;"><strong>Archivo:</strong> ${fileName}</p>` : ""}
                  ${technology ? `<p style="margin: 5px 0;"><strong>Tecnología:</strong> ${technology}</p>` : ""}
                </div>
                
                ${driveUrl ? `
                <h3 style="color: #333; margin-top: 30px;">Archivos del pedido:</h3>
                <p>Puedes acceder al archivo subido por el cliente en el siguiente enlace de Google Drive:</p>
                <div style="margin-top: 15px;">
                  <a href="${driveUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Ver Archivo en Drive</a>
                </div>
                ` : ""}
              </div>
            </div>
          `,
        });
        console.log(`Notification email sent for reference ${reference}`);
      } else {
        console.warn("RESEND_API_KEY is not configured. Email notification was skipped.");
      }
    } else {
      console.log(`Transaction ${reference} was updated to status: ${status}. No email sent.`);
    }

    // Acknowledge receipt of the webhook event
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("Error processing Wompi webhook:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
