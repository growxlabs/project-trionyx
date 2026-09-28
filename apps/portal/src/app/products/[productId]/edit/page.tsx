import React from 'react';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { requireInternalUser, AUTH_CONFIG, canWriteProducts } from '@trionyx/auth';
import {
  productsRepository,
  categoriesRepository,
  ensureDatabaseReady,
} from '@trionyx/database';
import { InternalShell } from '../../../../components/shell/InternalShell';
import { ProductForm } from '../../ProductForm';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;

  let authData;
  try {
    authData = await requireInternalUser(token);
  } catch {
    redirect('/login');
  }

  const { user } = authData;

  if (!canWriteProducts(user.role)) {
    redirect(`/products/${productId}`);
  }

  await ensureDatabaseReady();

  const product = await productsRepository.findWithRelations(productId);
  if (!product) {
    notFound();
  }

  const categories = await categoriesRepository.list({ status: 'ACTIVE' });

  return (
    <InternalShell user={user}>
      {/* Breadcrumb & Header */}
      <div className="mb-6 pb-4 border-b border-[var(--border)]">
        <div className="mb-2">
          <Link
            href={`/products/${product.id}`}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to {product.name}
          </Link>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-[12px] font-medium text-[var(--text-secondary)] bg-[var(--surface-subtle)] border border-[var(--border)] px-2 py-0.5 rounded-[2px]">
            {product.productCode}
          </span>
          <span className="text-[12px] font-medium text-[var(--text-muted)]">
            Edit Product Configuration
          </span>
        </div>
        <h1 className="text-[20px] font-semibold text-[var(--text-primary)] tracking-tight mt-1 m-0">
          Edit {product.name}
        </h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1 m-0">
          Update product descriptions, active status, public visibility, and technical specifications.
        </p>
      </div>

      <ProductForm
        categories={categories}
        initialData={product}
        isEdit={true}
        user={user}
      />
    </InternalShell>
  );
}
