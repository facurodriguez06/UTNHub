import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email, code, verificationPayload } = await request.json();

    if (!email || !code || !verificationPayload) {
      return NextResponse.json({ error: 'Faltan parámetros de verificación' }, { status: 400 });
    }

    const [expiresAtStr, signature] = verificationPayload.split('.');
    const expiresAt = parseInt(expiresAtStr, 10);

    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      return NextResponse.json({ error: 'El código ha expirado. Por favor, solicita uno nuevo.' }, { status: 400 });
    }

    const secret = process.env.OTP_SECRET || 'utnhub-secret-dev-key'; 
    const dataToSign = `${email}:${code}:${expiresAtStr}`;
    const expectedSignature = crypto.createHmac('sha256', secret).update(dataToSign).digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Código incorrecto. Inténtalo de nuevo.' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json({ error: 'Error interno de validación' }, { status: 500 });
  }
}
