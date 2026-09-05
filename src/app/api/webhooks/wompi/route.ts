import { NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { createHash } from "crypto";

/**
 * Wompi Webhook — Escucha eventos de transacciones.
 * Wompi envía un POST con el evento de la transacción.
 * Docs: https://docs.wompi.co/docs/colombia/eventos/
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Wompi sends events with this structure:
    // { event: "transaction.updated", data: { transaction: { ... } }, ... }
    const event = body.event;
    const transaction = body.data?.transaction;

    if (!transaction) {
      return NextResponse.json({ error: "No transaction data" }, { status: 400 });
    }

    // Verify the event signature if configured
    const wompiEventsSecret = process.env.WOMPI_EVENTS_SECRET;
    if (wompiEventsSecret) {
      const signature = body.signature;
      const properties = signature?.properties || [];
      const checksum = signature?.checksum;

      // Build the string to hash from the properties
      const valuesToHash = properties.map((prop: string) => {
        const keys = prop.split(".");
        let value: Record<string, unknown> = body;
        for (const key of keys) {
          value = value[key] as Record<string, unknown>;
        }
        return value;
      });

      const stringToHash = valuesToHash.join("") + body.timestamp + wompiEventsSecret;
      const computedChecksum = createHash("sha256").update(stringToHash).digest("hex");

      if (computedChecksum !== checksum) {
        console.error("Wompi webhook signature mismatch");
        return NextResponse.json({ error: "Signature mismatch" }, { status: 401 });
      }
    }

    // Only process APPROVED transactions
    if (event === "transaction.updated" && transaction.status === "APPROVED") {
      const reference = transaction.reference;
      const amountCOP = (transaction.amount_in_cents / 100);
      const customerEmail = transaction.customer_email;
      const customerName = transaction.customer_data?.full_name || "N/A";
      const paymentMethod = transaction.payment_method_type;

      const adminEmail = process.env.ADMIN_EMAIL || "admin@3d-ta.com";

      try {
        await resend.emails.send({
          from: "3D-Ta Orders <onboarding@resend.dev>",
          to: adminEmail,
          subject: `🎉 Nueva orden de impresión 3D pagada — $${amountCOP.toLocaleString("es-CO")} COP`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a1a; color: #e0e0e0; border-radius: 12px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #22d3ee; margin: 0;">💳 Pago Recibido via Wompi</h1>
                <p style="color: #888; margin: 4px 0 0;">Nueva orden de impresión 3D</p>
              </div>
              
              <div style="background: rgba(6, 182, 212, 0.1); padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
                <p style="color: #888; margin: 0; font-size: 12px;">TOTAL PAGADO</p>
                <p style="color: #22d3ee; font-size: 32px; font-weight: bold; margin: 4px 0;">
                  $${amountCOP.toLocaleString("es-CO")} COP
                </p>
              </div>
              
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 10px 0; color: #888; border-bottom: 1px solid #222;">Referencia:</td>
                  <td style="padding: 10px 0; font-weight: bold; border-bottom: 1px solid #222;">${reference}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #888; border-bottom: 1px solid #222;">Cliente:</td>
                  <td style="padding: 10px 0; font-weight: bold; border-bottom: 1px solid #222;">${customerName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #888; border-bottom: 1px solid #222;">Email:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #222;">
                    <a href="mailto:${customerEmail}" style="color: #06b6d4;">${customerEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #888; border-bottom: 1px solid #222;">Método de pago:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #222;">${paymentMethod}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #888; border-bottom: 1px solid #222;">ID Transacción:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #222;">${transaction.id}</td>
                </tr>
              </table>
              
              <p style="margin-top: 24px; font-size: 12px; color: #555; text-align: center;">
                Wompi Transaction ID: ${transaction.id}
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Error sending order notification email:", emailError);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Wompi webhook error:", error);
    return NextResponse.json(
      { error: "Error processing webhook." },
      { status: 500 }
    );
  }
}
