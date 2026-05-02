import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, author, subject, type } = body;

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      console.warn("DISCORD_WEBHOOK_URL no está configurado.");
      // Return success anyway so we don't break the client if it's not configured
      return NextResponse.json({ success: true, warning: 'No webhook url configured' });
    }

    // Determine the base URL (e.g. for localhost vs production)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://utnhub.com';

    const message = {
      content: `📝 **Nuevo apunte pendiente de aprobación**\n\n**Título:** ${title}\n**Autor:** ${author}\n**Materia:** ${subject}\n**Tipo:** ${type}\n\n👉 [Ir al panel de admin para revisar](${baseUrl}/admin)`
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      console.error("Error enviando webhook a Discord:", await response.text());
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en notify route:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
