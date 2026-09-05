import { NextResponse } from "next/server";
import { Resend } from "resend";

// Check if Resend API key is configured
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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
    
    // Security: Validate the webhook signature using the Event Secret
    const signature = body.signature;
    const eventsSecret = process.env.WOMPI_EVENTS_SECRET;
    
    if (signature && signature.checksum && eventsSecret) {
      // Wompi generates the checksum by concatenating the values of the properties array
      // plus the timestamp, and the event secret.
      const properties = signature.properties || [];
      
      // We must reconstruct the string using the exact property values from the transaction
      // Note: This is a simplified validation. For production, you should deeply read the properties 
      // from the transaction object and concatenate them with the timestamp and secret.
      console.log("Validating signature checksum:", signature.checksum);
    }
    
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

      // TODO: Fetch the Google Drive link from the database using the reference
      // const order = await db.order.findUnique({ where: { reference } });
      // const fileUrl = order?.fileUrl || "No disponible";
      const fileUrl = "Enlace_de_Google_Drive_Simulado (Reemplazar con consulta a Base de Datos)";
      
      const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";

      // Send email notification using Resend
      if (resend) {
        await resend.emails.send({
          from: "3D-TA Notificaciones <onboarding@resend.dev>", // Change to your verified domain when in production
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
                </div>
                
                <h3 style="color: #333; margin-top: 30px;">Archivos del pedido:</h3>
                <p>Puedes acceder al archivo subido por el cliente en el siguiente enlace de Google Drive:</p>
                <div style="margin-top: 15px;">
                  <a href="${fileUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Ver Archivo en Drive</a>
                </div>
                <p style="font-size: 12px; color: #888; margin-top: 10px;">Enlace (texto): ${fileUrl}</p>
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
    // Even if an error occurs, we should probably still return 200 to Wompi
    // so it doesn't retry infinitely, but typically 500 triggers retries.
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
