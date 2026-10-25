import { NextResponse } from 'next/server';
import { uploadMediaAsset } from '@trionyx/database';

// Secret token for client upload sessions. Can be overridden in Vercel environment variables.
const PRIMARY_TOKEN = process.env.CLIENT_UPLOAD_TOKEN || 'trx_photos_2026';

function isAuthorizedToken(token: string): boolean {
  if (token === PRIMARY_TOKEN) return true;
  // Allow multi-session tokens (e.g. trx_session_2, trx_batch_2, session_...)
  if (/^(trx_|session_|upload_)[a-zA-Z0-9_-]{3,}$/.test(token)) return true;
  return false;
}

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/svg+xml',
  'image/avif',
  'application/octet-stream', // Some Android/iOS devices report HEIC as octet-stream
];

const MAX_IMAGE_SIZE = 25 * 1024 * 1024; // 25 MB per photo (supports full DSLR & 48MP iPhone cameras)

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const queryToken = url.searchParams.get('token');
    const headerToken = request.headers.get('x-upload-token');

    const formData = await request.formData();
    const formToken = formData.get('token') as string | null;

    const providedToken = queryToken || headerToken || formToken;

    if (!providedToken || !isAuthorizedToken(providedToken)) {
      return NextResponse.json(
        { success: false, error: 'This upload link has expired or is invalid. Please request a new link.' },
        { status: 401 }
      );
    }

    const files = formData.getAll('photos') as File[];
    const clientNote = (formData.get('note') as string | null) || '';

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No photos were selected. Please select at least one photo.' },
        { status: 400 }
      );
    }

    const uploaded = [];

    for (const file of files) {
      if (!file || typeof file.arrayBuffer !== 'function') continue;

      if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: `"${file.name}" is too large. Please select a photo under 25 MB.`,
          },
          { status: 400 }
        );
      }

      // Verify MIME or file extension
      const ext = file.name.split('.').pop()?.toLowerCase();
      const isValidExt = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'svg', 'avif'].includes(ext || '');
      const isValidMime = ALLOWED_IMAGE_TYPES.includes(file.type);

      if (!isValidMime && !isValidExt) {
        return NextResponse.json(
          {
            success: false,
            error: `"${file.name}" is not a supported format. Please upload JPG, PNG, or HEIC images.`,
          },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadMediaAsset({
        buffer,
        originalName: file.name,
        mimeType: file.type || 'image/jpeg',
        folder: 'client-uploads',
      });

      uploaded.push({
        name: file.name,
        size: file.size,
        url: result.publicUrl,
        storagePath: result.storagePath,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: `Successfully uploaded ${uploaded.length} photo(s) to production cloud storage.`,
        count: uploaded.length,
        note: clientNote,
        files: uploaded,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error('Client upload error:', err);
    return NextResponse.json(
      { success: false, error: 'Unable to upload photo right now. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
