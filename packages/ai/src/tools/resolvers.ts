import { inventoryService } from '@trionyx/api';

export type ProductResolution =
  | { success: true; productId: string; productName: string }
  | { success: false; errorCode: 'TRIX_PRODUCT_NOT_FOUND' | 'TRIX_PRODUCT_AMBIGUOUS'; message: string };

export type LocationResolution =
  | { success: true; locationId: string; locationName: string }
  | { success: false; errorCode: 'TRIX_LOCATION_NOT_FOUND' | 'TRIX_LOCATION_AMBIGUOUS'; message: string };

export type ProductResolver = (query: { productId?: string; productName?: string }) => Promise<
  | { found: true; product: { id: string; name: string; slug?: string; productCode?: string } }
  | { found: false; ambiguous?: boolean; matches?: Array<{ id: string; name: string }> }
  | { ambiguous: true; matches: Array<{ id: string; name: string }>; found?: boolean }
>;

export type LocationResolver = (query: { locationId?: string; locationName?: string }) => Promise<
  | { found: true; location: { id: string; name: string; code?: string } }
  | { found: false; ambiguous?: boolean; matches?: Array<{ id: string; name: string }> }
  | { ambiguous: true; matches: Array<{ id: string; name: string }>; found?: boolean }
>;

export async function resolveProductTarget(
  query: { productId?: string; productName?: string },
  resolver: ProductResolver = inventoryService.resolveProduct
): Promise<ProductResolution> {
  if (query.productId) {
    const res = await resolver({ productId: query.productId });
    if (!res.found || !('product' in res)) {
      return { success: false, errorCode: 'TRIX_PRODUCT_NOT_FOUND', message: `No product found for ID "${query.productId}".` };
    }
    return { success: true, productId: res.product.id, productName: res.product.name };
  }

  if (query.productName) {
    const res = await resolver({ productName: query.productName });
    if (!res.found) {
      if ('ambiguous' in res && res.ambiguous && 'matches' in res && res.matches) {
        const names = res.matches.map((m: { name: string }) => m.name).join(', ');
        return {
          success: false,
          errorCode: 'TRIX_PRODUCT_AMBIGUOUS',
          message: `Multiple products matched "${query.productName}": ${names}. Please specify which product.`,
        };
      }
      return { success: false, errorCode: 'TRIX_PRODUCT_NOT_FOUND', message: `No product found matching "${query.productName}".` };
    }
    if ('product' in res) {
      return { success: true, productId: res.product.id, productName: res.product.name };
    }
  }

  return { success: false, errorCode: 'TRIX_PRODUCT_NOT_FOUND', message: 'No product specified.' };
}

export async function resolveLocationTarget(
  query: { locationId?: string; locationName?: string },
  resolver: LocationResolver = inventoryService.resolveLocation
): Promise<LocationResolution> {
  if (query.locationId) {
    const res = await resolver({ locationId: query.locationId });
    if (!res.found || !('location' in res)) {
      return { success: false, errorCode: 'TRIX_LOCATION_NOT_FOUND', message: `No location found for ID "${query.locationId}".` };
    }
    return { success: true, locationId: res.location.id, locationName: res.location.name };
  }

  if (query.locationName) {
    const res = await resolver({ locationName: query.locationName });
    if (!res.found) {
      if ('ambiguous' in res && res.ambiguous && 'matches' in res && res.matches) {
        const names = res.matches.map((m: { name: string }) => m.name).join(', ');
        return {
          success: false,
          errorCode: 'TRIX_LOCATION_AMBIGUOUS',
          message: `Multiple locations matched "${query.locationName}": ${names}. Please specify which location.`,
        };
      }
      return { success: false, errorCode: 'TRIX_LOCATION_NOT_FOUND', message: `No location found matching "${query.locationName}".` };
    }
    if ('location' in res) {
      return { success: true, locationId: res.location.id, locationName: res.location.name };
    }
  }

  return { success: false, errorCode: 'TRIX_LOCATION_NOT_FOUND', message: 'No location specified.' };
}
