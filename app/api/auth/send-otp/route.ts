import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'El correo electrónico es requerido' }, { status: 400 });
    }

    // Generate a secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Valid for 15 minutes
    const expiresAt = Date.now() + 15 * 60 * 1000;
    
    // Generate a stateless hash signature
    const secret = process.env.OTP_SECRET || 'utnhub-secret-dev-key'; 
    const dataToSign = `${email}:${otp}:${expiresAt}`;
    const signature = crypto.createHmac('sha256', secret).update(dataToSign).digest('hex');

    const verificationPayload = `${expiresAt}.${signature}`;

    // Send email using Resend if enabled, else log it for local testing
    if (process.env.RESEND_API_KEY) {
       await resend.emails.send({
          from: 'UTNHub <noreply@utnhub.com>', // User's custom verified domain!
          to: email,
          subject: 'UTNHub - Código de verificación',
          text: `¡Hola! Estás a un paso de unirte a UTNHub.\n\nTu código de verificación de 6 dígitos es: ${otp}\n\nEste código expirará en 15 minutos. No lo compartas con nadie.`,
          html: `
            <div style="font-family: Arial, sans-serif; text-align: center; color: #3D3229; padding: 20px;">
              <h2>¡Hola! Estás a un paso de unirte a UTNHub.</h2>
              <p>Tu código de verificación de 6 dígitos es:</p>
              <div style="font-size: 32px; font-weight: bold; padding: 20px; background-color: #F4FBFA; border: 2px dashed #8BAA91; border-radius: 12px; margin: 20px auto; width: fit-content; letter-spacing: 5px;">
                ${otp}
              </div>
              <p style="color: #A0A0A0; font-size: 12px;">Este código expirará en 15 minutos. No lo compartas con nadie.</p>
            </div>
          `
       });
    } else {
       console.log(`\n======================================================`);
       console.log(`[MOCK EMAIL SENT] To: ${email}`);
       console.log(`[MOCK EMAIL SENT] CODE: ${otp}`);
       console.log(`======================================================\n`);
    }

    return NextResponse.json({ 
      success: true, 
      verificationPayload 
    });

  } catch (error: unknown) {
    console.error("Error sending OTP:", error);
    return NextResponse.json({ error: 'Ocurrió un error al enviar el código. Inténtalo de nuevo.' }, { status: 500 });
  }
}
