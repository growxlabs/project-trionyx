'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Product, ProductCategory, SafeUser } from '@trionyx/types';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { SerialNumberLookupModal } from '../../components/inventory/SerialNumberLookupModal';
import {
  OperationalSummary,
  StatusBadge,
  RegistryToolbar,
  useRegisterWorkspaceViews,
  type WorkspaceViewsConfig,
} from '../../components/workspace';
import { ProductEmptyState } from './ProductEmptyState';

interface ProductsTableProps {
  initialProducts: (Product & { categoryName?: string; availableUnits?: number })[];
  categories: ProductCategory[];
  user: SafeUser;
}

export type ProductWorkspaceTab = 'registry' | 'attention' | 'families';

export function ProductsTable({ initialProducts, categories, user }: ProductsTableProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProductWorkspaceTab>('registry');
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

  const workspaceViews = useMemo<WorkspaceViewsConfig>(
    () => ({
      storageKey: 'trionyx-workspace-products',
      activeId: activeTab,
      onSelect: (id: string) => setActiveTab(id as ProductWorkspaceTab),
      sections: [
        {
          items: [
            {
              id: 'registry',
              label: 'Product Registry',
            },
            {
              id: 'attention',
              label: 'Needs Attention',
            },
            {
              id: 'families',
              label: 'Product Families',
            },
          ],
        },
      ],
    }),
    [activeTab]
  );
  useRegisterWorkspaceViews(workspaceViews);

  return (
    <div className="space-y-8">
      {/* 1. Operational Summary + primary actions */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <OperationalSummary
          segments={[
            { text: 'Right now the catalogue holds ' },
            { value: products.length },
            { text: ' products — ' },
            { value: activeCount, tone: 'positive' },
            { text: ' active, ' },
            { value: publicCount, tone: 'info' },
            { text: ' public, across ' },
            { value: categoryStats.length },
            { text: ' categories.' },
          ]}
        />
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setShowLookupModal(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[4px] border border-[var(--border)] bg-[var(--surface-raised)] hover:bg-[var(--surface-subtle)] text-[var(--text-primary)] text-[13px] font-medium transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 text-[var(--text-secondary)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 7V5a2 2 0 0 1 2-2h2" />
              <path d="M17 3h2a2 2 0 0 1 2 2v2" />
              <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
              <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
              <line x1="7" y1="7" x2="7" y2="17" />
              <line x1="12" y1="7" x2="12" y2="17" />
              <line x1="17" y1="7" x2="17" y2="17" />
            </svg>
            <span>Lookup Serial</span>
          </button>
          {canWrite && (
            <Link
              href="/products/new"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[4px] bg-[var(--accent)] hover:opacity-90 text-white text-[13px] font-semibold transition-opacity shadow-xs"
            >
              <svg className="w-4 h-4 text-white shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>New Product</span>
            </Link>
          )}
        </div>
      </div>

      {/* 3. Workspace Stage — view selection lives in the secondary sidebar */}
      <div className="w-full">
          {/* TAB 1: PRODUCT REGISTRY */}
          {activeTab === 'registry' && (
            <section aria-labelledby="product-registry-heading" className="space-y-3">
              {filteredProducts.length > 0 && (
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                <h2 id="product-registry-heading" className="text-[14px] font-semibold text-[var(--text-primary)] m-0 shrink-0">
                  Product Registry
                </h2>
                {selectedCategory !== 'ALL' && (
                  <span className="text-[12px] font-normal text-[var(--text-secondary)] shrink-0">
                    · Filtered by {categories.find((c) => c.id === selectedCategory)?.name || 'Category'}
                  </span>
                )}
                </div>
                <RegistryToolbar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search product name, code (TRX-PROD-...), or slug..."
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
              </div>
              )}

              {/* Working Table */}
              <div className={`overflow-hidden ${filteredProducts.length === 0 ? '' : 'bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px]'}`}>
                {filteredProducts.length === 0 ? (
                  <ProductEmptyState
                    kind="registry"
                    title={products.length === 0 ? 'No products yet' : 'No matching products'}
                    description={
                      search || selectedCategory !== 'ALL' || selectedStatus !== 'ALL' || selectedVisibility !== 'ALL'
                        ? 'Try a different search or clear your filters.'
                        : products.length === 0 ? 'Add your first product to build the catalog.' : 'No products match this view.'
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
                          Clear filters
                        </button>
                      ) : undefined
                    }
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--border)]/60 bg-[var(--surface-subtle)] text-[12px] font-semibold text-[var(--text-secondary)]">
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
                            <tr key={p.id} className="hover:bg-[var(--surface-subtle)] transition-colors h-[42px]">
                              <td className="py-2.5 px-4 font-mono text-[12px] text-[var(--text-secondary)]">
                                <Link href={`/products/${p.id}`} className="hover:text-[var(--accent)] hover:underline">
                                  {p.productCode}
                                </Link>
                              </td>
                              <td className="py-2.5 px-4">
                                <Link
                                  href={`/products/${p.id}`}
                                  className="text-[14px] font-medium text-[var(--text-primary)] hover:text-[var(--accent)] block"
                                >
                                  {p.name}
                                </Link>
                                {p.shortDescription && (
                                  <span className="text-[12px] text-[var(--text-secondary)] line-clamp-1">
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
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium ${
                                    units === 0
                                      ? 'bg-[var(--status-danger-soft)] text-[var(--status-danger)] border border-[var(--status-danger-border)]'
                                      : units < 5
                                      ? 'bg-[var(--status-warning-soft)] text-[var(--status-warning)] border border-[var(--status-warning-border)]'
                                      : 'bg-[var(--surface-subtle)] text-[var(--status-success)] border border-[var(--border)]'
                                  }`}
                                >
                                  {units} {units === 1 ? 'unit' : 'units'}
                                </span>
                              </td>
                              <td className="py-2.5 px-4">
                                <span
                                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium ${
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
                                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium capitalize ${
                                    p.publicVisibility === 'PUBLIC'
                                      ? 'bg-[var(--status-info-soft)] text-[var(--status-info)] border border-[var(--status-info-border)]'
                                      : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] border border-[var(--border)]'
                                  }`}
                                >
                                  {p.publicVisibility.toLowerCase()}
                                </span>
                              </td>
                              <td className="py-2.5 px-4">
                                <StatusBadge status={p.status} />
                              </td>
                              <td className="py-2.5 px-4 text-right">
                                <div className="inline-flex items-center gap-2.5">
                                  <Link
                                    href={`/products/${p.id}`}
                                    className="text-[13px] font-medium text-[var(--accent)] hover:underline"
                                  >
                                    View →
                                  </Link>
                                  {canWrite && p.status !== 'ARCHIVED' && (
                                    <>
                                      <Link
                                        href={`/products/${p.id}/edit`}
                                        className="inline-flex items-center gap-1 text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline"
                                      >
                                        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                        <span>Edit</span>
                                      </Link>
                                      <button
                                        type="button"
                                        onClick={() => setArchiveTarget(p)}
                                        className="text-[13px] text-[var(--status-danger)] hover:underline cursor-pointer"
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
          )}

          {/* TAB 2: NEEDS ATTENTION */}
          {activeTab === 'attention' && (
            <section aria-labelledby="stock-attention-heading" className={`p-4 space-y-4 ${stockAttentionItems.length > 0 ? 'bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px]' : ''}`}>
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[var(--status-danger)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" />
                  </svg>
                  <h2 id="stock-attention-heading" className="text-[14px] font-semibold text-[var(--status-danger)] m-0">
                    Needs Attention ({stockAttentionItems.length})
                  </h2>
                </div>
                <Link
                  href="/inventory"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-[3px] bg-[var(--accent)] text-white hover:opacity-90 transition-opacity shadow-xs"
                >
                  <svg className="w-3.5 h-3.5 text-white shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.29 7 12 12 20.71 7" />
                    <line x1="12" y1="22" x2="12" y2="12" />
                  </svg>
                  <span>Receive Serials</span>
                </Link>
              </div>

              {stockAttentionItems.length === 0 ? (
                <ProductEmptyState kind="attention" title="No stock issues" description="All products have enough stock." />
              ) : (
                <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-[4px] bg-[var(--surface-subtle)]">
                  {stockAttentionItems.map((p) => (
                    <div key={p.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px] hover:bg-[var(--surface-raised)] transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[12px] text-[var(--text-secondary)]">{p.productCode}</span>
                        <Link href={`/products/${p.id}`} className="text-[14px] font-medium text-[var(--text-primary)] hover:text-[var(--accent)]">
                          {p.name}
                        </Link>
                        <span className="text-[13px] text-[var(--text-secondary)]">· {p.categoryName || 'General'}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`text-[12px] font-medium px-2 py-0.5 rounded ${
                            (p.availableUnits ?? 0) === 0
                              ? 'bg-[var(--status-danger-soft)] text-[var(--status-danger)] border border-[var(--status-danger-border)]'
                              : 'bg-[var(--status-warning-soft)] text-[var(--status-warning)] border border-[var(--status-warning-border)]'
                          }`}
                        >
                          {p.availableUnits ?? 0} available
                        </span>
                        <Link
                          href="/inventory"
                          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--accent)] hover:underline"
                        >
                          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                            <polyline points="3.29 7 12 12 20.71 7" />
                            <line x1="12" y1="22" x2="12" y2="12" />
                          </svg>
                          <span>Receive Stock →</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* TAB 3: PRODUCT FAMILIES */}
          {activeTab === 'families' && (
            <section aria-labelledby="product-families-heading" className={`p-4 space-y-4 ${categoryStats.length > 0 ? 'bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px]' : ''}`}>
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[var(--text-secondary)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                  <h2 id="product-families-heading" className="text-[14px] font-semibold text-[var(--text-primary)] m-0">
                    Product Families ({categoryStats.length})
                  </h2>
                </div>
                {selectedCategory !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('ALL')}
                    className="text-[12px] font-medium text-[var(--accent)] hover:underline cursor-pointer"
                  >
                    Clear Filter ({categories.find((c) => c.id === selectedCategory)?.name})
                  </button>
                )}
              </div>

              {categoryStats.length === 0 ? (
                <ProductEmptyState kind="families" title="No product families yet" description="Product categories will appear here." />
              ) : <>
              <p className="text-[13px] text-[var(--text-secondary)] m-0">
                Select any product family below to filter the master registry.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categoryStats.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(isSelected ? 'ALL' : cat.id);
                        setActiveTab('registry');
                      }}
                      className={`p-3.5 rounded-[4px] border text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-[var(--accent)] bg-[var(--surface-subtle)] ring-1 ring-[var(--accent)]'
                          : 'border-[var(--border)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-raised)]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-[14px] text-[var(--text-primary)]">
                          {cat.name}
                        </span>
                        <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--text-secondary)]">
                          {cat.formulaCount} formulas
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[12px]">
                        <span className="text-[var(--text-secondary)]">Available Stock:</span>
                        <span className={`font-semibold ${cat.totalUnits === 0 ? 'text-[var(--status-danger)]' : 'text-[var(--status-success)]'}`}>
                          {cat.totalUnits} units
                        </span>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-[var(--border)]/60 text-right">
                        <span className="text-[12px] font-medium text-[var(--accent)]">
                          Filter in Registry →
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              </>}
            </section>
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
