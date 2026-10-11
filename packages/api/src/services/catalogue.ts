import {
  ensureDatabaseReady,
  productsRepository,
  categoriesRepository,
  brandsRepository,
} from '@trionyx/database';
import type {
  PublicProductSummary,
  PublicProductDetail,
  ProductWithRelations,
} from '@trionyx/types';

function formatProductSummary(product: ProductWithRelations): PublicProductSummary {
  const images = (product.media || [])
    .filter((m) => m.type === 'IMAGE')
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const primaryMedia = images[0];

  const sortedSpecs = (product.specifications || []).sort((a, b) => a.sortOrder - b.sortOrder);
  const keySpec = sortedSpecs[0] ? { label: sortedSpecs[0].label, value: sortedSpecs[0].value } : null;

  return {
    id: product.id,
    productCode: product.productCode,
    name: product.name,
    slug: product.slug,
    brandName: product.brand?.name ?? null,
    brandSlug: product.brand?.slug ?? null,
    categoryName: product.category?.name ?? null,
    categorySlug: product.category?.slug ?? null,
    shortDescription: product.shortDescription,
    primaryImage: primaryMedia
      ? {
          url: primaryMedia.storagePath,
          altText: primaryMedia.altText || product.name,
        }
      : null,
    keySpecification: keySpec,
  };
}

function formatProductDetail(product: ProductWithRelations): PublicProductDetail {
  const summary = formatProductSummary(product);
  const images = (product.media || [])
    .filter((m) => m.type === 'IMAGE')
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const specifications = (product.specifications || [])
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((s) => ({
      id: s.id,
      label: s.label,
      value: s.value,
      sortOrder: s.sortOrder,
    }));

  return {
    ...summary,
    description: product.description,
    specifications,
    galleryImages: images.map((img) => ({
      id: img.id,
      url: img.storagePath,
      altText: img.altText || product.name,
      sortOrder: img.sortOrder,
    })),
    brand: product.brand
      ? {
          name: product.brand.name,
          slug: product.brand.slug,
          description: product.brand.description,
        }
      : null,
    category: product.category
      ? {
          name: product.category.name,
          slug: product.category.slug,
          description: product.category.description,
        }
      : null,
  };
}

export const publicCatalogueService = {
  async listPublishedProducts(
    businessCode: string,
    options?: {
      categorySlug?: string;
      brandSlug?: string;
      search?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ items: PublicProductSummary[]; total: number }> {
    const client = await ensureDatabaseReady();

    let categoryId: string | undefined;
    if (options?.categorySlug) {
      const cat = await categoriesRepository.findBySlug(options.categorySlug, businessCode, client);
      if (cat) categoryId = cat.id;
      else return { items: [], total: 0 };
    }

    let brandId: string | undefined;
    if (options?.brandSlug) {
      const brand = await brandsRepository.findBySlug(options.brandSlug, businessCode, client);
      if (brand) brandId = brand.id;
      else return { items: [], total: 0 };
    }

    const [products, total] = await Promise.all([
      productsRepository.list(
        {
          businessCode,
          brandId,
          categoryId,
          status: 'ACTIVE',
          publicVisibility: 'PUBLIC',
          search: options?.search,
          limit: options?.limit,
          offset: options?.offset,
        },
        client
      ),
      productsRepository.count(
        {
          businessCode,
          brandId,
          categoryId,
          status: 'ACTIVE',
          publicVisibility: 'PUBLIC',
          search: options?.search,
        },
        client
      ),
    ]);

    // Hydrate relations for each product
    const itemsWithRelations = await Promise.all(
      products.map(async (p) => {
        const full = await productsRepository.findWithRelations(p.id, client);
        return formatProductSummary(full || (p as ProductWithRelations));
      })
    );

    return {
      items: itemsWithRelations,
      total,
    };
  },

  async getPublishedProductBySlug(businessCode: string, slug: string): Promise<PublicProductDetail | null> {
    const client = await ensureDatabaseReady();
    const product = await productsRepository.findBySlugWithRelations(slug, businessCode, client);
    if (!product) return null;
    if (product.status !== 'ACTIVE' || product.publicVisibility !== 'PUBLIC') {
      return null;
    }
    return formatProductDetail(product);
  },

  async listPublishedBrands(businessCode: string) {
    const client = await ensureDatabaseReady();
    const brands = await brandsRepository.list({ businessCode, status: 'ACTIVE' }, client);
    return brands.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      description: b.description,
    }));
  },

  async listPublishedCategories(businessCode: string, brandSlug?: string) {
    const client = await ensureDatabaseReady();
    let brandId: string | undefined;
    if (brandSlug) {
      const brand = await brandsRepository.findBySlug(brandSlug, businessCode, client);
      if (brand) brandId = brand.id;
    }
    const categories = await categoriesRepository.list({ businessCode, brandId, status: 'ACTIVE' }, client);
    const brands = await brandsRepository.list({ businessCode, status: 'ACTIVE' }, client);
    const brandMap = new Map(brands.map((b) => [b.id, b]));

    return categories.map((c) => {
      const brand = c.brandId ? brandMap.get(c.brandId) : null;
      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        brandId: c.brandId,
        brandName: brand?.name ?? null,
        brandSlug: brand?.slug ?? null,
      };
    });
  },
};
