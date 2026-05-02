import { NextResponse } from 'next/server';
import { getStorageAdapter } from '@/lib/storage';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file = data.get('file');
    const folder = data.get('folder')?.toString() || 'notes';
    let title = data.get('title')?.toString();

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No se recibió ningún archivo.' },
        { status: 400 }
      );
    }

    // --- PROTECCIONES DE SEGURIDAD DEL SERVIDOR ---
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB límite estricto
    const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.zip', '.rar', '.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
    
    // 1. Prevenir ataques de saturación de almacenamiento (archivos gigantes)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'El archivo es demasiado grande (Límite estricto: 50MB).' },
        { status: 400 }
      );
    }
    
    // 2. Prevenir subida de archivos maliciosos (.exe, .sh, .php, etc)
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return NextResponse.json(
        { error: `Por seguridad, el formato ${fileExtension} no está permitido.` },
        { status: 400 }
      );
    }
    // ----------------------------------------------
    
    if (!title || title.trim() === '') {
       title = file.name.replace(/\.[^/.]+$/, '');
    }

    const adapter = getStorageAdapter();
    const result = await adapter.upload(file, folder, title);

    return NextResponse.json({
      url: result.url,
      path: result.path,
      provider: result.provider
    });
  } catch (error) {
    console.error('Error in upload route:', error);
    const message = error instanceof Error ? error.message : 'Error al subir el archivo.';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
