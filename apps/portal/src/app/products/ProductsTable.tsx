'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Product, ProductCategory, SafeUser } from '@trionyx/types';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { SerialNumberLookupModal } from '../../components/inventory/SerialNumberLookupModal';

interface ProductsTableProps {
  initialProducts: (Product & { categoryName?: string; availableUnits?: number })[];
  categories: ProductCategory[];
  user: SafeUser;
}

export function ProductsTable({ initialProducts, categories, user }: ProductsTableProps) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedVisibility, setSelectedVisibility] = useState<string>('ALL');
  const [showLookupModal, setShowLookupModal] = useState(false);

  // Archive dialog state
  const [archiveTarget, setArchiveTarget] = useState<Product | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const canWrite = user.role === 'MANAGING_DIRECTOR' || user.role === 'ADMIN';

  // Filter products locally for instant response
  const filtered = products.filter((p) => {
    if (selectedCategory !== 'ALL' && p.categoryId !== selectedCategory) return false;
    if (selectedStatus !== 'ALL' && p.status !== selectedStatus) return false;
    if (selectedVisibility !== 'ALL' && p.publicVisibility !== selectedVisibility) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = p.name.toLowerCase().includes(term);
      const matchCode = p.productCode.toLowerCase().includes(term);
      const matchSlug = p.slug.toLowerCase().includes(term);
      if (!matchName && !matchCode && !matchSlug) return false;
    }
    return true;
  });

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

  const statusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-[var(--status-success-soft)] text-[var(--status-success)] border-[var(--status-success-border)]';
      case 'DRAFT':
        return 'bg-[var(--status-warning-soft)] text-[var(--status-warning)] border-[var(--status-warning-border)]';
      case 'INACTIVE':
        return 'bg-[var(--surface-subtle)] text-[var(--text-muted)] border-[var(--border)]';
      case 'ARCHIVED':
        return 'bg-[var(--status-danger-soft)] text-[var(--status-danger)] border-[var(--status-danger-border)]';
      default:
        return 'bg-[var(--surface-subtle)] text-[var(--text-primary)] border-[var(--border)]';
    }
  };

  return (
    <div>
      {/* Action & Filter Bar */}
      <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] p-4 sm:p-5 mb-6 shadow-[0_1px_3px_rgba(23,23,20,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search product name, code (TRX-PROD-...), or slug..."
              className="w-full pl-9 pr-4 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Direct Serial Number Lookup trigger */}
            <button
              type="button"
              onClick={() => setShowLookupModal(true)}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--surface-subtle)] text-[var(--text-primary)] text-[13px] font-semibold transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 text-[var(--accent-text)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>Lookup Serial</span>
            </button>

            {/* New Product Action (MD & Admin only) */}
            {canWrite && (
              <Link
                href="/products/new"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[6px] bg-[var(--text-primary)] hover:bg-[var(--surface-subtle)] active:bg-[var(--surface-subtle)] text-[var(--background)] text-[13px] font-semibold transition-colors cursor-pointer shrink-0"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>New Product</span>
              </Link>
            )}
          </div>
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[var(--border)] text-[12.5px]">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-secondary)] font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-[4px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] font-medium text-[12.5px] focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)]"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-secondary)] font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-[4px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] font-medium text-[12.5px] focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)]"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          {/* Visibility Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-secondary)] font-medium">Visibility:</span>
            <select
              value={selectedVisibility}
              onChange={(e) => setSelectedVisibility(e.target.value)}
              className="px-2.5 py-1.5 rounded-[4px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] font-medium text-[12.5px] focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)]"
            >
              <option value="ALL">All Visibility</option>
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>

          {(searchTerm || selectedCategory !== 'ALL' || selectedStatus !== 'ALL' || selectedVisibility !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('ALL');
                setSelectedStatus('ALL');
                setSelectedVisibility('ALL');
              }}
              className="text-[12px] text-[var(--accent-text)] hover:underline font-semibold ml-auto"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Operational Products Table */}
      <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] overflow-hidden shadow-[0_1px_3px_rgba(23,23,20,0.03)]">
        {filtered.length === 0 ? (
          <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] mb-3">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            </div>
            <h4 className="text-[15px] font-semibold text-[var(--text-primary)] m-0">
              No products found
            </h4>
            <p className="text-[13px] text-[var(--text-secondary)] mt-1 m-0 max-w-sm">
              {products.length === 0
                ? 'No products have been added yet. Use "New Product" to register your first catalog item.'
                : 'No products match your active search and filter criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface)] text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  <th className="py-3 px-4 sm:px-6">Product</th>
                  <th className="py-3 px-4">Product Code</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Available Units</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Visibility</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-[13px]">
                {filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-[var(--background)] transition-colors">
                    <td className="py-3.5 px-4 sm:px-6">
                      <Link
                        href={`/products/${product.id}`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent-text)] transition-colors block leading-snug"
                      >
                        {product.name}
                      </Link>
                      {product.shortDescription && (
                        <p className="text-[12px] text-[var(--text-secondary)] mt-0.5 m-0 line-clamp-1">
                          {product.shortDescription}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[12px] text-[var(--text-primary)]">
                      {product.productCode}
                    </td>
                    <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                      {product.categoryName || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[11px] font-mono font-bold text-[var(--text-primary)]">
                        {product.availableUnits ?? 0} Unit{product.availableUnits === 1 ? '' : 's'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-[4px] border text-[11px] font-semibold uppercase tracking-wider ${statusBadge(
                          product.status
                        )}`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-[4px] border text-[11px] font-semibold uppercase tracking-wider ${
                          product.publicVisibility === 'PUBLIC'
                            ? 'bg-[var(--status-info-soft)] text-[var(--status-info)] border-[var(--status-info-border)]'
                            : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] border-[var(--border)]'
                        }`}
                      >
                        {product.publicVisibility}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Link
                        href={`/products/${product.id}`}
                        className="inline-flex items-center px-2.5 py-1 rounded-[4px] border border-[var(--border)] bg-[var(--surface-raised)] hover:bg-[var(--surface-subtle)] text-[var(--text-primary)] text-[12px] font-semibold transition-colors"
                      >
                        View
                      </Link>
                      {canWrite && product.status !== 'ARCHIVED' && (
                        <>
                          <Link
                            href={`/products/${product.id}/edit`}
                            className="inline-flex items-center px-2.5 py-1 rounded-[4px] border border-[var(--border)] bg-[var(--surface-raised)] hover:bg-[var(--surface-subtle)] text-[var(--text-primary)] text-[12px] font-semibold transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => setArchiveTarget(product)}
                            className="inline-flex items-center px-2.5 py-1 rounded-[4px] border border-[var(--status-danger-border)] bg-[var(--status-danger-soft)] hover:bg-[var(--status-danger-soft)] text-[var(--status-danger)] text-[12px] font-semibold transition-colors cursor-pointer"
                          >
                            Archive
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
