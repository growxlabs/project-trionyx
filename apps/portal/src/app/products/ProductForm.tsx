'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ProductCategory, ProductWithRelations, SafeUser } from '@trionyx/types';

interface ProductFormProps {
  categories: ProductCategory[];
  initialData?: ProductWithRelations;
  isEdit?: boolean;
  user: SafeUser;
}

export function ProductForm({ categories: initialCategories, initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();

  const [categories, setCategories] = useState<ProductCategory[]>(initialCategories);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || categories[0]?.id || '');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState<'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'>(
    initialData?.status || 'DRAFT'
  );
  const [publicVisibility, setPublicVisibility] = useState<'PRIVATE' | 'PUBLIC'>(
    initialData?.publicVisibility || 'PRIVATE'
  );

  // Specifications state
  const [specifications, setSpecifications] = useState<Array<{ label: string; value: string }>>(
    initialData?.specifications?.map((s) => ({ label: s.label, value: s.value })) || [
      { label: 'Formulation', value: '' },
      { label: 'Curing Time', value: '' },
    ]
  );

  // Inline Category Creation Modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [isCreatingCat, setIsCreatingCat] = useState(false);

  // Auto-generate slug from name if not manually edited
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit && !slug) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const addSpecRow = () => {
    setSpecifications((prev) => [...prev, { label: '', value: '' }]);
  };

  const removeSpecRow = (index: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSpecRow = (index: number, field: 'label' | 'value', value: string) => {
    setSpecifications((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName || !newCatSlug || isCreatingCat) return;
    setIsCreatingCat(true);

    try {
      const res = await fetch('/api/v1/internal/product-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName, slug: newCatSlug }),
      });
      const data = await res.json();
      const cat = data.data || data.category;
      if (res.ok && cat) {
        setCategories((prev) => [...prev, cat]);
        setCategoryId(cat.id);
        setShowCategoryModal(false);
        setNewCatName('');
        setNewCatSlug('');
      } else {
        alert(data.error?.message || data.error || 'Failed to create category');
      }
    } catch {
      alert('Error creating category');
    } finally {
      setIsCreatingCat(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);

    if (!name.trim()) {
      setErrorBanner('Product name is required.');
      return;
    }
    if (!slug.trim()) {
      setErrorBanner('Product slug is required.');
      return;
    }
    if (!categoryId) {
      setErrorBanner('Please select a product category.');
      return;
    }

    // Filter valid specifications
    const cleanSpecs = specifications
      .filter((s) => s.label.trim() && s.value.trim())
      .map((s, idx) => ({ label: s.label.trim(), value: s.value.trim(), sortOrder: idx }));

    setIsSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        categoryId,
        shortDescription: shortDescription.trim() || null,
        description: description.trim() || null,
        status,
        publicVisibility,
        specifications: cleanSpecs,
      };

      const url = isEdit ? `/api/products/${initialData?.id}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorBanner(data.error || 'Failed to save product.');
        setIsSubmitting(false);
        return;
      }

      router.push(`/products/${data.product.id}`);
      router.refresh();
    } catch {
      setErrorBanner('Network error while saving product.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl">
      {errorBanner && (
        <div className="mb-6 p-4 rounded-[6px] bg-[var(--status-danger-soft)] border border-[var(--status-danger-border)] text-[var(--status-danger)] text-[13.5px] flex items-center gap-2.5">
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{errorBanner}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Identity */}
        <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] p-6 shadow-[0_1px_3px_rgba(23,23,20,0.03)] space-y-5">
          <h2 className="text-[16px] font-semibold text-[var(--text-primary)] pb-3 border-b border-[var(--border)] m-0">
            Product Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Graphene Matrix Coating"
                className="w-full px-3.5 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Slug (URL identifier) *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                placeholder="e.g. graphene-matrix-coating"
                className="w-full px-3.5 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13.5px] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Category *
                </label>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  className="text-[11.5px] font-semibold text-[var(--accent-text)] hover:underline cursor-pointer"
                >
                  + New Category
                </button>
              </div>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED')}
                className="w-full px-3 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                {isEdit && <option value="ARCHIVED">Archived</option>}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Public Visibility
              </label>
              <select
                value={publicVisibility}
                onChange={(e) => setPublicVisibility(e.target.value as 'PRIVATE' | 'PUBLIC')}
                className="w-full px-3 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              >
                <option value="PRIVATE">Private (Internal Only)</option>
                <option value="PUBLIC">Public (Visible on Website)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Short Description (One-line summary)
            </label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="e.g. 10H Hardness ceramic-graphene matrix engineered for harsh climatic conditions."
              className="w-full px-3.5 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Detailed Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Comprehensive product specifications, application directions, and warranty parameters..."
              className="w-full px-3.5 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] resize-y"
            />
          </div>
        </div>

        {/* Section 2: Product Specifications */}
        <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] p-6 shadow-[0_1px_3px_rgba(23,23,20,0.03)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div>
              <h2 className="text-[16px] font-semibold text-[var(--text-primary)] m-0">
                Product Specifications
              </h2>
              <p className="text-[12px] text-[var(--text-secondary)] mt-0.5 m-0">
                Flexible key-value specification attributes.
              </p>
            </div>
            <button
              type="button"
              onClick={addSpecRow}
              className="px-3 py-1.5 rounded-[4px] border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--surface-subtle)] text-[var(--text-primary)] text-[12px] font-semibold transition-colors cursor-pointer"
            >
              + Add Specification
            </button>
          </div>

          <div className="space-y-3">
            {specifications.map((s, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="text"
                  value={s.label}
                  onChange={(e) => updateSpecRow(index, 'label', e.target.value)}
                  placeholder="e.g. Hardness Rating"
                  className="w-1/3 px-3 py-1.5 rounded-[4px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)]"
                />
                <input
                  type="text"
                  value={s.value}
                  onChange={(e) => updateSpecRow(index, 'value', e.target.value)}
                  placeholder="e.g. 10H Certified"
                  className="flex-1 px-3 py-1.5 rounded-[4px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)]"
                />
                <button
                  type="button"
                  onClick={() => removeSpecRow(index)}
                  className="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--status-danger)] hover:bg-[var(--status-danger-soft)] transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-[var(--border)]">
          <Link
            href="/products"
            className="px-4 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--surface-raised)] hover:bg-[var(--background)] text-[var(--text-primary)] text-[13.5px] font-semibold transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-6 py-2 rounded-[6px] bg-[var(--text-primary)] hover:bg-[var(--surface-subtle)] active:bg-[var(--surface-subtle)] text-[var(--background)] text-[13.5px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSubmitting && (
              <svg className="animate-spin h-4 w-4 text-[var(--background)]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            <span>{isEdit ? 'Save Changes' : 'Create Product'}</span>
          </button>
        </div>
      </form>

      {/* Quick Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-[16px] font-semibold text-[var(--text-primary)] mb-4">
              Add New Category
            </h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] uppercase mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => {
                    setNewCatName(e.target.value);
                    if (!newCatSlug) {
                      setNewCatSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-+|-+$/g, '')
                      );
                    }
                  }}
                  placeholder="e.g. PPF & Self-Healing Films"
                  className="w-full px-3 py-1.5 rounded border border-[var(--border)] bg-[var(--background)] text-[13px]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] uppercase mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  required
                  value={newCatSlug}
                  onChange={(e) => setNewCatSlug(e.target.value.toLowerCase())}
                  placeholder="e.g. ppf-films"
                  className="w-full px-3 py-1.5 rounded border border-[var(--border)] bg-[var(--background)] text-[13px] font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-3 py-1.5 rounded border border-[var(--border)] text-[12px] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCat}
                  className="px-4 py-1.5 rounded bg-[var(--text-primary)] text-[var(--background)] text-[12px] font-semibold"
                >
                  {isCreatingCat ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
