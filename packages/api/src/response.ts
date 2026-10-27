import type {
  ApiSuccessResponse,
  ApiCollectionResponse,
  ApiErrorResponse,
  ApiErrorCode,
  PaginationMeta,
} from '@trionyx/types';
import { formatUserFriendlyError } from '@trionyx/validation';

/**
 * Standard successful single-resource response
 */
export function apiSuccess<T>(data: T, status = 200, headers?: HeadersInit): Response {
  const body: ApiSuccessResponse<T> = { data };
  return Response.json(body, {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

/**
 * Standard successful collection response with pagination metadata
 */
export function apiCollection<T>(
  data: T[],
  meta: PaginationMeta,
  status = 200,
  headers?: HeadersInit
): Response {
  const body: ApiCollectionResponse<T> = { data, meta };
  return Response.json(body, {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

/**
 * Standard error response
 */
export function apiError(
  code: ApiErrorCode | string,
  message: string,
  status = 400,
  details?: unknown,
  headers?: HeadersInit
): Response {
  const friendlyMessage = formatUserFriendlyError(message);
  let resolvedStatus = status;
  if (status === 500 && (friendlyMessage.includes('already exists') || friendlyMessage.includes('already in use'))) {
    resolvedStatus = 409;
  }
  const body: ApiErrorResponse = {
    error: {
      code,
      message: friendlyMessage,
      ...(details !== undefined ? { details } : {}),
    },
  };
  return Response.json(body, {
    status: resolvedStatus,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}
