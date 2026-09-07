import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";

export async function POST(request: Request) {
  try {
    const { name, mimeType } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "File name is required" }, { status: 400 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!clientId || !clientSecret || !refreshToken || !driveFolderId) {
      return NextResponse.json(
        { error: "Google OAuth credentials or Drive Folder ID not configured in environment variables" },
        { status: 500 }
      );
    }

    // Configurar cliente OAuth2
    const oauth2Client = new OAuth2Client(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    // Obtener token de acceso
    const tokenResponse = await oauth2Client.getAccessToken();
    const accessToken = tokenResponse.token;

    if (!accessToken) {
      throw new Error("Failed to get access token");
    }

    // Preparar metadatos del archivo para Google Drive
    const fileMetadata = {
      name: name,
      parents: [driveFolderId],
    };

    // Get the origin of the request to pass it to Google Drive for CORS
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Crear la sesión de subida reanudable (Resumable Upload)
    const initResponse = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Upload-Content-Type": mimeType || "model/stl", // Tipo MIME del archivo
        "Origin": origin, // Obligatorio para que Google Drive permita el PUT desde el frontend
      },
      body: JSON.stringify(fileMetadata),
    });

    if (!initResponse.ok) {
      const errorText = await initResponse.text();
      throw new Error(`Failed to initialize upload session: ${initResponse.status} ${errorText}`);
    }

    // Google devuelve la URL de subida (resumable URL) en el header "Location"
    const uploadUrl = initResponse.headers.get("Location");

    if (!uploadUrl) {
      throw new Error("Location header not found in Google Drive response");
    }

    // Extract file ID from the response body (Google returns file metadata on creation)
    let fileId = "";
    try {
      const responseBody = await initResponse.json();
      fileId = responseBody.id || "";
    } catch {
      // If no JSON body, try to extract from upload URL
      const match = uploadUrl.match(/upload_id=([^&]+)/);
      if (match) {
        // The file ID will be available after the upload completes
        // For now, we'll do a simple metadata query after upload
        fileId = "";
      }
    }

    return NextResponse.json({ uploadUrl, fileId, accessToken });

  } catch (error) {
    console.error("Error generating upload URL:", error);
    return NextResponse.json(
      { error: "Error generating upload URL" },
      { status: 500 }
    );
  }
}
