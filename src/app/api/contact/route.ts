import { NextResponse } from "next/server";
import { resend } from "@/lib/resend";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, serviceType, message } = body;

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !serviceType?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Todos los campos obligatorios deben ser completados." },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email inválido." },
        { status: 400 }
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL || "admin@3d-ta.com";

    // Send email notification to admin
    await resend.emails.send({
      from: "3D-Ta <onboarding@resend.dev>",
      to: adminEmail,
      subject: `📩 Nueva solicitud de contacto — ${serviceType}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a1a; color: #e0e0e0; border-radius: 12px;">
          <h1 style="color: #06b6d4; margin-bottom: 24px;">Nueva solicitud de contacto</h1>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 0; color: #888; width: 120px;">Nombre:</td>
              <td style="padding: 8px 0; font-weight: bold;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888;">Email:</td>
              <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #06b6d4;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888;">Teléfono:</td>
              <td style="padding: 8px 0;">${phone || "No proporcionado"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888;">Servicio:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #8b5cf6;">${serviceType}</td>
            </tr>
          </table>
          
          <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; border-left: 3px solid #06b6d4;">
            <p style="color: #888; margin: 0 0 8px 0; font-size: 12px;">MENSAJE:</p>
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          
          <p style="margin-top: 24px; font-size: 12px; color: #555;">
            Enviado desde el formulario de contacto de 3D-Ta
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor. Intenta de nuevo más tarde." },
      { status: 500 }
    );
  }
}
