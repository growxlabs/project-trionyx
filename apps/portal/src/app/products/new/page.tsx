import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireInternalUser, AUTH_CONFIG, canWriteProducts } from '@trionyx/auth';
import { categoriesRepository, ensureDatabaseReady } from '@trionyx/database';
import { InternalShell } from '../../../components/shell/InternalShell';
import { ProductForm } from '../ProductForm';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
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
    redirect('/products');
  }

  await ensureDatabaseReady();

  const categories = await categoriesRepository.list({ status: 'ACTIVE' });

  return (
    <InternalShell user={user}>
      {/* Breadcrumb & Header */}
      <div className="mb-6 pb-4 border-b border-[var(--border)]">
        <div className="mb-2">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Products Catalog
          </Link>
        </div>
        <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-[var(--accent-text)] block mb-1">
          CATALOG MANAGEMENT
        </span>
        <h1 className="text-[26px] sm:text-[30px] font-semibold text-[var(--text-primary)] tracking-[-0.03em] m-0">
          Create New Product
        </h1>
        <p className="text-[13.5px] text-[var(--text-secondary)] mt-1 m-0">
          Register a new automotive chemical formula, configure initial SKUs and technical specifications.
        </p>
      </div>

      <ProductForm categories={categories} user={user} />
    </InternalShell>
  );
}
