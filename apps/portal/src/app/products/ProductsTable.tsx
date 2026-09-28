'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Product, ProductCategory, SafeUser } from '@trionyx/types';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { SerialNumberLookupModal } from '../../components/inventory/SerialNumberLookupModal';
import {
  WorkspaceHeader,
  StatusBadge,
  RegistryToolbar,
  EmptyOperationalState,
} from '../../components/workspace';

interface ProductsTableProps {
  initialProducts: (Product & { categoryName?: string; availableUnits?: number })[];
  categories: ProductCategory[];
  user: SafeUser;
}

export function ProductsTable({ initialProducts, categories, user }: ProductsTableProps) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedVisibility, setSelectedVisibility] = useState<string>('ALL');
  const [showLookupModal, setShowLookupModal] = useState(false);

  // Archive dialog state
  const [archiveTarget, setArchiveTarget] = useState<Product | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const canWrite = user.role === 'MANAGING_DIRECTOR' || user.role === 'ADMIN';

  // Derived metrics
  const activeCount = useMemo(() => products.filter((p) => p.status === 'ACTIVE').length, [products]);
  const draftOrInactiveCount = useMemo(() => products.filter((p) => p.status !== 'ACTIVE').length, [products]);
  const totalAvailableStock = useMemo(
    () => products.reduce((acc, p) => acc + (p.availableUnits ?? 0), 0),
    [products]
  );
  const publicCount = useMemo(() => products.filter((p) => p.publicVisibility === 'PUBLIC').length, [products]);

  // Out of stock or low stock items (< 5 units)
  const stockAttentionItems = useMemo(
    () =>
      products
        .filter((p) => p.status === 'ACTIVE' && (p.availableUnits ?? 0) < 5)
        .sort((a, b) => (a.availableUnits ?? 0) - (b.availableUnits ?? 0)),
    [products]
  );

  // Category family statistics
  const categoryStats = useMemo(() => {
    return categories.map((cat) => {
      const catProducts = products.filter((p) => p.categoryId === cat.id);
      const units = catProducts.reduce((acc, p) => acc + (p.availableUnits ?? 0), 0);
      return {
        id: cat.id,
        name: cat.name,
        formulaCount: catProducts.length,
        totalUnits: units,
      };
    });
  }, [categories, products]);

  // Product Families pagination (4 per page to prevent excessive vertical height on mobile & compact row on desktop)
  const [familyPage, setFamilyPage] = useState(1);
  const FAMILY_PAGE_SIZE = 4;
  const totalFamilyPages = Math.max(1, Math.ceil(categoryStats.length / FAMILY_PAGE_SIZE));
  const currentFamilyPage = Math.min(familyPage, totalFamilyPages);

  const paginatedFamilies = useMemo(() => {
    const start = (currentFamilyPage - 1) * FAMILY_PAGE_SIZE;
    return categoryStats.slice(start, start + FAMILY_PAGE_SIZE);
  }, [categoryStats, currentFamilyPage]);

  // Filter products locally for instant response
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'ALL' && p.categoryId !== selectedCategory) return false;
      if (selectedStatus !== 'ALL' && p.status !== selectedStatus) return false;
      if (selectedVisibility !== 'ALL' && p.publicVisibility !== selectedVisibility) return false;
      if (search.trim()) {
        const term = search.toLowerCase();
        const matchName = p.name.toLowerCase().includes(term);
        const matchCode = p.productCode.toLowerCase().includes(term);
        const matchSlug = p.slug.toLowerCase().includes(term);
        const matchDesc = p.shortDescription ? p.shortDescription.toLowerCase().includes(term) : false;
        if (!matchName && !matchCode && !matchSlug && !matchDesc) return false;
      }
      return true;
    });
  }, [products, search, selectedCategory, selectedStatus, selectedVisibility]);

  const handleArchiveConfirm = async () => {
    if (!archiveTarget || isArchiving) return;
    setIsArchiving(true);

    try {
      const res = await fetch(`/api/v1/internal/products/${archiveTarget.id}/archive`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && !data.error) {
        setProducts((prev) =>
          prev.map((p) => (p.id === archiveTarget.id ? { ...p, status: 'ARCHIVED' } : p))
        );
        router.refresh();
      } else {
        alert(data.error?.message || data.error || 'Failed to archive product');
      }
    } catch {
      alert('Network error while archiving product');
    } finally {
      setIsArchiving(false);
      setArchiveTarget(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header: Products with count and action */}
      <WorkspaceHeader
        title="Products"
        meta={<span className="font-mono text-[13px] text-[var(--text-muted)]">{products.length} products</span>}
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowLookupModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border border-[var(--border)] bg-[var(--surface-raised)] hover:bg-[var(--surface-subtle)] text-[var(--text-primary)] text-[13px] font-semibold transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>Lookup Serial</span>
            </button>
            {canWrite && (
              <Link
                href="/products/new"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] bg-[var(--accent)] hover:opacity-90 text-white text-[13px] font-semibold transition-opacity shadow-xs"
              >
                + New Product
              </Link>
            )}
          </div>
        }
      />

      {/* 2. Product Families */}
      {categoryStats.length > 0 && (
        <section aria-labelledby="product-families-heading" className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 id="product-families-heading" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] m-0">
                PRODUCT FAMILIES
              </h2>
              <span className="font-mono text-[10px] text-[var(--text-muted)]">
                ({categoryStats.length})
              </span>
            </div>

            {totalFamilyPages > 1 && (
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                  {currentFamilyPage} / {totalFamilyPages}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setFamilyPage((p) => Math.max(1, p - 1))}
                    disabled={currentFamilyPage === 1}
                    className="w-7 h-7 flex items-center justify-center rounded-[3px] border border-[var(--border)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-raised)] disabled:opacity-30 disabled:cursor-not-allowed text-[var(--text-primary)] transition-colors cursor-pointer"
                    aria-label="Previous families"
                    title="Previous page"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFamilyPage((p) => Math.min(totalFamilyPages, p + 1))}
                    disabled={currentFamilyPage === totalFamilyPages}
                    className="w-7 h-7 flex items-center justify-center rounded-[3px] border border-[var(--border)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-raised)] disabled:opacity-30 disabled:cursor-not-allowed text-[var(--text-primary)] transition-colors cursor-pointer"
                    aria-label="Next families"
                    title="Next page"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {paginatedFamilies.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(isSelected ? 'ALL' : cat.id)}
                  className={`p-3 rounded-[4px] border text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-[var(--accent)] bg-[var(--surface-subtle)] ring-1 ring-[var(--accent)]'
                      : 'border-[var(--border)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-raised)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-semibold text-[13px] text-[var(--text-primary)]">
                      {cat.name}
                    </span>
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--text-secondary)]">
                      {cat.formulaCount}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11.5px]">
                    <span className="text-[var(--text-muted)]">Stock:</span>
                    <span className={`font-mono font-semibold ${cat.totalUnits === 0 ? 'text-[var(--status-danger)]' : 'text-[var(--status-success)]'}`}>
                      {cat.totalUnits} units
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. Needs Attention */}
      {stockAttentionItems.length > 0 && (
        <section aria-labelledby="stock-attention-heading" className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] p-4">
          <div className="flex items-baseline justify-between mb-3">
            <h2 id="stock-attention-heading" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--status-danger)] m-0">
              NEEDS ATTENTION ({stockAttentionItems.length})
            </h2>
          </div>

          <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-[4px] bg-[var(--surface-subtle)]">
            {stockAttentionItems.slice(0, 3).map((p) => (
              <div key={p.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px]">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11.5px] text-[var(--text-muted)]">{p.productCode}</span>
                  <Link href={`/products/${p.id}`} className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]">
                    {p.name}
                  </Link>
                  <span className="text-[12px] text-[var(--text-secondary)]">· {p.categoryName || 'General'}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`font-mono text-[12px] font-bold px-2 py-0.5 rounded ${
                    (p.availableUnits ?? 0) === 0
                      ? 'bg-[var(--status-danger-soft)] text-[var(--status-danger)] border border-[var(--status-danger-border)]'
                      : 'bg-[var(--status-warning-soft)] text-[var(--status-warning)] border border-[var(--status-warning-border)]'
                  }`}>
                    {p.availableUnits ?? 0} Available
                  </span>
                  <Link
                    href="/inventory"
                    className="text-[12px] font-semibold text-[var(--accent)] hover:underline"
                  >
                    Receive Stock →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Product Registry */}
      <section aria-labelledby="product-registry-heading">
        <h2 id="product-registry-heading" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] mb-3">
          PRODUCT REGISTRY
        </h2>

        {/* Compact Registry Toolbar */}
        <RegistryToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search product name, code (TRX-PROD-...), or slug..."
          totalCount={products.length}
          filteredCount={filteredProducts.length}
          unitLabel="products"
          filters={[
            {
              id: 'category',
              label: 'Category',
              value: selectedCategory,
              onChange: setSelectedCategory,
              options: [
                { label: 'All Categories', value: 'ALL' },
                ...categories.map((c) => ({ label: c.name, value: c.id })),
              ],
            },
            {
              id: 'status',
              label: 'Status',
              value: selectedStatus,
              onChange: setSelectedStatus,
              options: [
                { label: 'All Statuses', value: 'ALL' },
                { label: `Active (${activeCount})`, value: 'ACTIVE' },
                { label: 'Draft', value: 'DRAFT' },
                { label: 'Inactive', value: 'INACTIVE' },
                { label: 'Archived', value: 'ARCHIVED' },
              ],
            },
            {
              id: 'visibility',
              label: 'Visibility',
              value: selectedVisibility,
              onChange: setSelectedVisibility,
              options: [
                { label: 'All Visibility', value: 'ALL' },
                { label: `Public (${publicCount})`, value: 'PUBLIC' },
                { label: 'Private (Internal)', value: 'PRIVATE' },
              ],
            },
          ]}
        />

        {/* Working Table */}
        <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] overflow-hidden">
          {filteredProducts.length === 0 ? (
            <EmptyOperationalState
              title="No products match current filters"
              description={
                search || selectedCategory !== 'ALL' || selectedStatus !== 'ALL' || selectedVisibility !== 'ALL'
                  ? 'Try clearing the search or filter controls to view all catalog items.'
                  : 'No products have been registered in the database yet.'
              }
              action={
                search || selectedCategory !== 'ALL' || selectedStatus !== 'ALL' || selectedVisibility !== 'ALL' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      setSelectedCategory('ALL');
                      setSelectedStatus('ALL');
                      setSelectedVisibility('ALL');
                    }}
                    className="text-[12px] font-semibold text-[var(--accent)] hover:underline cursor-pointer"
                  >
                    Reset all filters
                  </button>
                ) : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-subtle)] text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                    <th className="py-2.5 px-4 w-32">Product Code</th>
                    <th className="py-2.5 px-4">Formula / Name</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4 text-center w-28">Available Stock</th>
                    <th className="py-2.5 px-4 w-28">Dealer Access</th>
                    <th className="py-2.5 px-4 w-24">Visibility</th>
                    <th className="py-2.5 px-4 w-24">Status</th>
                    <th className="py-2.5 px-4 text-right w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredProducts.map((p) => {
                    const units = p.availableUnits ?? 0;
                    return (
                      <tr key={p.id} className="hover:bg-[var(--surface-subtle)] transition-colors">
                        <td className="py-2.5 px-4 font-mono font-semibold text-[12px] text-[var(--text-primary)]">
                          <Link href={`/products/${p.id}`} className="hover:text-[var(--accent)] hover:underline">
                            {p.productCode}
                          </Link>
                        </td>
                        <td className="py-2.5 px-4">
                          <Link
                            href={`/products/${p.id}`}
                            className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)] block"
                          >
                            {p.name}
                          </Link>
                          {p.shortDescription && (
                            <span className="text-[11.5px] text-[var(--text-muted)] line-clamp-1">
                              {p.shortDescription}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-[var(--text-secondary)]">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[var(--surface-subtle)] border border-[var(--border)] text-[var(--text-secondary)]">
                            {p.categoryName || 'General'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded font-mono text-[11.5px] font-bold ${
                              units === 0
                                ? 'bg-[var(--status-danger-soft)] text-[var(--status-danger)] border border-[var(--status-danger-border)]'
                                : units < 5
                                ? 'bg-[var(--status-warning-soft)] text-[var(--status-warning)] border border-[var(--status-warning-border)]'
                                : 'bg-[var(--surface-subtle)] text-[var(--status-success)] border border-[var(--border)]'
                            }`}
                          >
                            {units} {units === 1 ? 'Unit' : 'Units'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-[12px]">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10.5px] font-semibold ${
                              p.dealerVisibility
                                ? 'bg-[var(--status-success-soft)] text-[var(--status-success)] border border-[var(--status-success-border)]'
                                : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] border border-[var(--border)]'
                            }`}
                          >
                            {p.dealerVisibility ? 'Available' : 'Restricted'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10.5px] font-semibold uppercase tracking-wider ${
                              p.publicVisibility === 'PUBLIC'
                                ? 'bg-[var(--status-info-soft)] text-[var(--status-info)] border border-[var(--status-info-border)]'
                                : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] border border-[var(--border)]'
                            }`}
                          >
                            {p.publicVisibility}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <Link
                              href={`/products/${p.id}`}
                              className="text-[12px] font-semibold text-[var(--accent)] hover:underline"
                            >
                              View →
                            </Link>
                            {canWrite && p.status !== 'ARCHIVED' && (
                              <>
                                <Link
                                  href={`/products/${p.id}/edit`}
                                  className="text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline"
                                >
                                  Edit
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => setArchiveTarget(p)}
                                  className="text-[12px] text-[var(--status-danger)] hover:underline cursor-pointer"
                                >
                                  Archive
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Confirmation Dialog for Product Archival */}
      <ConfirmDialog
        isOpen={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        onConfirm={handleArchiveConfirm}
        title="Archive Product"
        description={`Are you sure you want to archive "${archiveTarget?.name}" (${archiveTarget?.productCode})? It will be marked inactive in the catalog, but all historical inventory records and stock movements will remain permanently intact.`}
        confirmLabel="Archive Product"
        isDestructive={true}
        isLoading={isArchiving}
      />

      {/* Global Interactive Serial Number Lookup Modal */}
      <SerialNumberLookupModal
        isOpen={showLookupModal}
        onClose={() => setShowLookupModal(false)}
      />
    </div>
  );
}
