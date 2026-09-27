import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as path from 'path';
import * as fs from 'fs';
import { randomUUID } from 'crypto';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  if (!supabaseClient) {
    supabaseClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseClient;
}

export function isSupabaseStorageEnabled(): boolean {
  return getSupabaseClient() !== null;
}

export interface UploadResult {
  storagePath: string; // The URL or path to save in mediaRepository
  publicUrl: string;
}

export async function uploadMediaAsset(options: {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  folder?: string;
}): Promise<UploadResult> {
  const { buffer, originalName, mimeType, folder = 'products' } = options;
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'trionyx-media';

  const ext = path.extname(originalName) || (mimeType.startsWith('image/') ? '.jpg' : '.pdf');
  const safeBase = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const uniqueName = `${folder}/${safeBase}_${randomUUID().substring(0, 8)}${ext}`;

  const client = getSupabaseClient();

  if (client) {
    // 1. Upload to Supabase Storage
    const { error: uploadError } = await client.storage
      .from(bucketName)
      .upload(uniqueName, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Supabase Storage upload failed: ${uploadError.message}`);
    }

    // 2. Get Public CDN URL
    const { data } = client.storage.from(bucketName).getPublicUrl(uniqueName);
    return {
      storagePath: data.publicUrl,
      publicUrl: data.publicUrl,
    };
  }

  // Fallback: Local disk storage (for local development without cloud storage configured)
  const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads', folder);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const destinationPath = path.join(uploadsDir, path.basename(uniqueName));
  fs.writeFileSync(destinationPath, buffer);

  const localPath = `/uploads/${folder}/${path.basename(uniqueName)}`;
  return {
    storagePath: localPath,
    publicUrl: localPath,
  };
}
