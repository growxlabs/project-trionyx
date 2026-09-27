import { cookies } from 'next/headers';
import * as path from 'path';
import * as fs from 'fs';
import { randomUUID } from 'crypto';
import { requireProductWritePermission, AUTH_CONFIG } from '@trionyx/auth';
import { mediaRepository, productsRepository, uploadMediaAsset } from '@trionyx/database';
import { apiSuccess, apiError } from '@trionyx/api';
import type { MediaType } from '@trionyx/types';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
const ALLOWED_DOC_TYPES = ['application/pdf', 'text/csv'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    await requireProductWritePermission(token);

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const productId = formData.get('productId') as string | null;
    const altText = (formData.get('altText') as string | null) || null;

    if (!file || !productId) {
      return apiError('VALIDATION_ERROR', 'File and productId are required', 422);
    }

    const product = await productsRepository.findById(productId);
    if (!product) {
      return apiError('NOT_FOUND', 'Product not found', 404);
    }

    const mimeType = file.type;
    const fileSize = file.size;
    let mediaType: MediaType;

    if (ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      if (fileSize > MAX_IMAGE_SIZE) {
        return apiError('VALIDATION_ERROR', 'Image exceeds maximum allowed size of 5 MB', 422);
      }
      mediaType = 'IMAGE';
    } else if (ALLOWED_DOC_TYPES.includes(mimeType)) {
      if (fileSize > MAX_DOC_SIZE) {
        return apiError('VALIDATION_ERROR', 'Document exceeds maximum allowed size of 10 MB', 422);
      }
      mediaType = 'DOCUMENT';
    } else {
      return apiError(
        'VALIDATION_ERROR',
        `Unsupported file type: ${mimeType}. Allowed: JPEG, PNG, WebP, SVG, PDF, CSV.`,
        422
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadResult = await uploadMediaAsset({
      buffer,
      originalName: file.name,
      mimeType,
      folder: 'products',
    });

    const media = await mediaRepository.create({
      productId,
      type: mediaType,
      storagePath: uploadResult.storagePath,
      fileName: file.name,
      fileSize,
      mimeType,
      altText,
    });

    return apiSuccess(media, 201);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to upload media', 500);
  }
}
