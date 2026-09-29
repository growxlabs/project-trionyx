'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type {
  ProductWithRelations,
  ProductCategory,
  SerialNumberWithDetails,
  SerialMovementWithDetails,
  SerialStatus,
  SafeUser,
  WarrantyPolicy,
} from '@trionyx/types';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { Modal } from '../../../components/ui/Modal';
import { SerialNumberLookupModal } from '../../../components/inventory/SerialNumberLookupModal';
import {
  IconArrowLeft,
  IconSearch,
  IconEdit,
  IconArchive,
  IconPlus,
  IconFileText,
  IconShieldCheck,
  IconUpload,
  IconTrash,
  IconAdjustmentsHorizontal,
  IconBarcode,
  IconPhoto,
  IconHistory,
} from '@tabler/icons-react';
import {
  OperationalSummaryStrip,
  StatusBadge,
} from '../../../components/workspace';
import { ProductEmptyState } from '../ProductEmptyState';

interface ProductDetailViewProps {
  product: ProductWithRelations;
  category: ProductCategory | null;
  serials: SerialNumberWithDetails[];
  movements: SerialMovementWithDetails[];
  warrantyPolicy?: WarrantyPolicy | null;
  user: SafeUser;
}

export function ProductDetailView({
  product: initialProduct,
  category,
  serials: initialSerials,
  movements: initialMovements,
  warrantyPolicy,
  user,
}: ProductDetailViewProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [product, setProduct] = useState<ProductWithRelations>(initialProduct);
  const [serials, setSerials] = useState<SerialNumberWithDetails[]>(initialSerials);
  const [movements] = useState<SerialMovementWithDetails[]>(initialMovements);
  const [policy, setPolicy] = useState<WarrantyPolicy | null>(warrantyPolicy ?? null);
  const [activeTab, setActiveTab] = useState<'overview' | 'serials' | 'specs' | 'media' | 'movements' | 'warranty'>('overview');

  // Warranty Policy Modal State
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policyDuration, setPolicyDuration] = useState<number>(warrantyPolicy?.durationMonths ?? 24);
  const [policyStatus, setPolicyStatus] = useState<'ACTIVE' | 'INACTIVE'>(warrantyPolicy?.status ?? 'ACTIVE');
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);
  const [policyError, setPolicyError] = useState<string | null>(null);

  // Serial list search & status filter
  const [serialSearch, setSerialSearch] = useState('');
  const [serialStatusFilter, setSerialStatusFilter] = useState<string>('ALL');

  // Archiving modal state
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  // Serial status adjustment state
  const [adjustTargetSerial, setAdjustTargetSerial] = useState<SerialNumberWithDetails | null>(null);
  const [adjustNewStatus, setAdjustNewStatus] = useState<SerialStatus>('INACTIVE');
  const [adjustReason, setAdjustReason] = useState('Damaged or compromised packaging during handling');
  const [adjustNotes, setAdjustNotes] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjustError, setAdjustError] = useState<string | null>(null);

  // Serial lookup modal state
  const [showLookupModal, setShowLookupModal] = useState(false);
  const [lookupInitialSerial, setLookupInitialSerial] = useState<string | undefined>(undefined);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadAltText, setUploadAltText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Media deletion
  const [deletingMediaId, setDeletingMediaId] = useState<string | null>(null);

  const canWrite = user.role === 'MANAGING_DIRECTOR' || user.role === 'ADMIN';

  // Compute stock counts derived from actual serial numbers
  const totalAvailable = serials.filter((s) => s.status === 'AVAILABLE').length;
  const totalTracked = serials.length;

  const filteredSerials = serials.filter((s) => {
    if (serialStatusFilter !== 'ALL' && s.status !== serialStatusFilter) return false;
    if (serialSearch.trim()) {
      const term = serialSearch.toLowerCase();
      const matchSn = s.serialNumber.toLowerCase().includes(term);
      const matchLoc = s.location?.name?.toLowerCase().includes(term) || s.location?.code?.toLowerCase().includes(term);
      return matchSn || matchLoc;
    }
    return true;
  });

  const handleArchive = async () => {
    setIsArchiving(true);
    try {
      const res = await fetch(`/api/v1/internal/products/${product.id}/archive`, {
        method: 'POST',
      });
      const data = await res.json();
      const updatedProduct = data.data || data.product;
      if (res.ok && updatedProduct) {
        setProduct((prev) => ({ ...prev, status: 'ARCHIVED' }));
        setShowArchiveDialog(false);
        router.refresh();
      } else {
        alert(data.error?.message || data.error || 'Failed to archive product.');
      }
    } catch {
      alert('Error communicating with server.');
    } finally {
      setIsArchiving(false);
    }
  };

  const handleAdjustStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTargetSerial) return;
    if (!adjustReason || adjustReason.trim().length < 3) {
      setAdjustError('A valid adjustment reason is mandatory (minimum 3 characters).');
      return;
    }

    setIsAdjusting(true);
    setAdjustError(null);

    try {
      const res = await fetch('/api/v1/internal/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serialRecordId: adjustTargetSerial.id,
          newStatus: adjustNewStatus,
          reason: adjustReason.trim(),
          notes: adjustNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setAdjustError(data.error?.message || data.error || 'Failed to adjust serial status.');
        setIsAdjusting(false);
        return;
      }

      setSerials((prev) =>
        prev.map((s) => (s.id === adjustTargetSerial.id ? { ...s, status: adjustNewStatus } : s))
      );
      setAdjustTargetSerial(null);
      router.refresh();
    } catch {
      setAdjustError('Network error while adjusting serial status.');
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('productId', product.id);
      if (uploadAltText.trim()) {
        formData.append('altText', uploadAltText.trim());
      }

      const res = await fetch('/api/v1/internal/media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      const mediaItem = data.data || data.media;
      if (!res.ok || data.error || !mediaItem) {
        setUploadError(data.error?.message || data.error || 'Upload failed.');
        setIsUploading(false);
        return;
      }

      setProduct((prev) => ({
        ...prev,
        media: [...prev.media, mediaItem],
      }));
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadAltText('');
      router.refresh();
    } catch {
      setUploadError('Failed to upload file due to network error.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm('Are you sure you want to remove this media asset?')) return;
    setDeletingMediaId(mediaId);

    try {
      const res = await fetch(`/api/v1/internal/media/${mediaId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && !data.error) {
        setProduct((prev) => ({
          ...prev,
          media: prev.media.filter((m) => m.id !== mediaId),
        }));
        router.refresh();
      } else {
        alert(data.error?.message || data.error || 'Failed to remove media.');
      }
    } catch {
      alert('Error removing media.');
    } finally {
      setDeletingMediaId(null);
    }
  };

  const handleSaveWarrantyPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (policyDuration < 1 || policyDuration > 120) {
      setPolicyError('Duration must be between 1 and 120 months');
      return;
    }

    setIsSavingPolicy(true);
    setPolicyError(null);

    try {
      const res = await fetch(`/api/v1/internal/products/${product.id}/warranty-policy`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          durationMonths: Number(policyDuration),
          status: policyStatus,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setPolicyError(json.error?.message || 'Failed to update warranty policy');
        return;
      }

      setPolicy(json.data);
      setShowPolicyModal(false);
      router.refresh();
    } catch {
      setPolicyError('Network error while saving warranty policy');
    } finally {
      setIsSavingPolicy(false);
    }
  };

  const statusBadge = (status: SerialStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-[var(--status-success-soft)] text-[var(--status-success)] border border-[var(--status-success-border)]';
      case 'TRANSFERRED':
        return 'bg-[var(--status-info-soft)] text-[var(--status-info)] border border-[var(--status-info-border)]';
      case 'INACTIVE':
        return 'bg-[var(--status-danger-soft)] text-[var(--status-danger)] border border-[var(--status-danger-border)]';
      default:
        return 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] border border-[var(--border)]';
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Breadcrumb & Action Header */}
      <div className="pb-3 border-b border-[var(--border)]">
        <div className="mb-2">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-[12px] font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <IconArrowLeft className="w-3.5 h-3.5" stroke={1.8} />
            Products Registry
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-[12px] font-semibold text-[var(--accent-text)] bg-[var(--accent-soft)] border border-[var(--accent-soft-border)] px-2 py-0.5 rounded-[2px]">
              {product.productCode}
            </span>
            <h1 className="text-[20px] font-semibold text-[var(--text-primary)] tracking-[-0.01em] m-0">
              {product.name}
            </h1>
            {category && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] text-[11px] font-medium bg-[var(--surface-subtle)] border border-[var(--border)] text-[var(--text-secondary)]">
                {category.name}
              </span>
            )}
            <StatusBadge status={product.status} />
            <StatusBadge status={product.publicVisibility} />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setLookupInitialSerial(undefined);
                setShowLookupModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] border border-[var(--border)] bg-[var(--surface-raised)] hover:bg-[var(--surface-subtle)] text-[var(--text-primary)] text-[12.5px] font-medium transition-colors cursor-pointer"
            >
              <IconSearch className="w-3.5 h-3.5 text-[var(--text-muted)]" stroke={1.8} />
              Lookup Serial
            </button>

            {canWrite && (
              <>
                <Link
                  href={`/products/${product.id}/edit`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[3px] bg-[var(--text-primary)] hover:opacity-90 text-[var(--background)] text-[12.5px] font-semibold transition-opacity shadow-xs"
                >
                  <IconEdit className="w-3.5 h-3.5" stroke={1.8} />
                  Edit Product
                </Link>

                {product.status !== 'ARCHIVED' && (
                  <button
                    type="button"
                    onClick={() => setShowArchiveDialog(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] border border-[var(--status-danger-border)] hover:bg-[var(--status-danger-soft)] text-[var(--status-danger)] text-[12.5px] font-medium transition-colors cursor-pointer"
                  >
                    <IconArchive className="w-3.5 h-3.5" stroke={1.8} />
                    Archive
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sleek Operational Summary Strip */}
      <OperationalSummaryStrip
        metrics={[
          {
            label: 'Available Stock',
            value: totalAvailable,
            detail: 'units',
            tone: totalAvailable > 0 ? 'positive' : 'default',
          },
          {
            label: 'Tracked Serials',
            value: totalTracked,
            detail: 'registered',
          },
          {
            label: 'Media & Docs',
            value: product.media.length,
            detail: 'assets',
          },
          {
            label: 'Serial Movements',
            value: movements.length,
            detail: 'events',
          },
        ]}
      />

      {/* ======================================================== */}
      {/* TWO-COLUMN LAYOUT: INSIDE PAGE NAVBAR + CONTENT AREA    */}
      {/* ======================================================== */}
      <div className="flex flex-col lg:flex-row gap-4 items-start w-full">
        {/* ======================================================== */}
        {/* 1. LEFT INSIDE PAGE NAVBAR (Operational Index / Tabs)    */}
        {/* ======================================================== */}
        <aside className="w-full lg:w-72 shrink-0 bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] p-3 space-y-4">
          {/* Section 1: Catalog & Formulation */}
          <div>
            <div className="px-2 pb-1.5 flex items-center justify-between text-[12px] font-semibold text-[var(--text-secondary)]">
              <span>Catalog & Specs</span>
              <span className="text-[11.5px] font-normal text-[var(--text-muted)]">
                {product.specifications.length} attrs
              </span>
            </div>

            <div className="space-y-0.5">
              {/* Formulation Overview */}
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`w-full text-left px-2.5 py-2 rounded-[3px] text-[13px] flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-[var(--surface-subtle)] font-semibold text-[var(--text-primary)] border-l-2 border-[var(--accent)]'
                    : 'text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]/60'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <IconFileText
                    stroke={1.6}
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      activeTab === 'overview' ? 'text-[#F26522]' : 'text-[var(--text-secondary)]'
                    }`}
                  />
                  <span className="truncate">Formulation Overview</span>
                </div>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-[2px] tabular-nums shrink-0 ml-2 bg-[var(--surface-subtle)] text-[var(--text-muted)]">
                  Core
                </span>
              </button>

              {/* Technical Specifications */}
              <button
                type="button"
                onClick={() => setActiveTab('specs')}
                className={`w-full text-left px-2.5 py-2 rounded-[3px] text-[13px] flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === 'specs'
                    ? 'bg-[var(--surface-subtle)] font-semibold text-[var(--text-primary)] border-l-2 border-[var(--accent)]'
                    : 'text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]/60'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <IconAdjustmentsHorizontal
                    stroke={1.6}
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      activeTab === 'specs' ? 'text-[#F26522]' : 'text-[var(--text-secondary)]'
                    }`}
                  />
                  <span className="truncate">Specifications</span>
                </div>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-[2px] tabular-nums shrink-0 ml-2 bg-[var(--surface-subtle)] text-[var(--text-muted)]">
                  {product.specifications.length}
                </span>
              </button>

              {/* Media & Documentation */}
              <button
                type="button"
                onClick={() => setActiveTab('media')}
                className={`w-full text-left px-2.5 py-2 rounded-[3px] text-[13px] flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === 'media'
                    ? 'bg-[var(--surface-subtle)] font-semibold text-[var(--text-primary)] border-l-2 border-[var(--accent)]'
                    : 'text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]/60'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <IconPhoto
                    stroke={1.6}
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      activeTab === 'media' ? 'text-[#F26522]' : 'text-[var(--text-secondary)]'
                    }`}
                  />
                  <span className="truncate">Media & Docs</span>
                </div>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-[2px] tabular-nums shrink-0 ml-2 bg-[var(--surface-subtle)] text-[var(--text-muted)]">
                  {product.media.length}
                </span>
              </button>
            </div>
          </div>

          {/* Section 2: Physical Inventory & Ledger */}
          <div className="pt-2 border-t border-[var(--border)]">
            <div className="px-2 pb-1.5 flex items-center justify-between text-[12px] font-semibold text-[var(--text-secondary)]">
              <span>Inventory & Ledger</span>
              <span className="text-[11.5px] font-normal text-[var(--text-muted)]">
                {totalAvailable} available
              </span>
            </div>

            <div className="space-y-0.5">
              {/* Tracked Serials */}
              <button
                type="button"
                onClick={() => setActiveTab('serials')}
                className={`w-full text-left px-2.5 py-2 rounded-[3px] text-[13px] flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === 'serials'
                    ? 'bg-[var(--surface-subtle)] font-semibold text-[var(--text-primary)] border-l-2 border-[var(--accent)]'
                    : 'text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]/60'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <IconBarcode
                    stroke={1.6}
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      activeTab === 'serials' ? 'text-[#F26522]' : 'text-[var(--text-secondary)]'
                    }`}
                  />
                  <span className="truncate">Tracked Serials</span>
                </div>
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-[2px] tabular-nums shrink-0 ml-2 ${
                    totalAvailable > 0
                      ? 'bg-[var(--status-success-soft)] text-[var(--status-success)] border border-[var(--status-success-border)]'
                      : 'bg-[var(--surface-subtle)] text-[var(--text-muted)]'
                  }`}
                >
                  {serials.length}
                </span>
              </button>

              {/* Movement History */}
              <button
                type="button"
                onClick={() => setActiveTab('movements')}
                className={`w-full text-left px-2.5 py-2 rounded-[3px] text-[13px] flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === 'movements'
                    ? 'bg-[var(--surface-subtle)] font-semibold text-[var(--text-primary)] border-l-2 border-[var(--accent)]'
                    : 'text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]/60'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <IconHistory
                    stroke={1.6}
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      activeTab === 'movements' ? 'text-[#F26522]' : 'text-[var(--text-secondary)]'
                    }`}
                  />
                  <span className="truncate">Serial Movements</span>
                </div>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-[2px] tabular-nums shrink-0 ml-2 bg-[var(--surface-subtle)] text-[var(--text-muted)]">
                  {movements.length}
                </span>
              </button>
            </div>
          </div>

          {/* Section 3: Governance & Coverage */}
          <div className="pt-2 border-t border-[var(--border)]">
            <div className="px-2 pb-1.5 flex items-center justify-between text-[12px] font-semibold text-[var(--text-secondary)]">
              <span>Governance</span>
            </div>

            <div className="space-y-0.5">
              {/* Warranty Policy */}
              <button
                type="button"
                onClick={() => setActiveTab('warranty')}
                className={`w-full text-left px-2.5 py-2 rounded-[3px] text-[13px] flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === 'warranty'
                    ? 'bg-[var(--surface-subtle)] font-semibold text-[var(--text-primary)] border-l-2 border-[var(--accent)]'
                    : 'text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]/60'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <IconShieldCheck
                    stroke={1.6}
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      activeTab === 'warranty' ? 'text-[#F26522]' : 'text-[var(--text-secondary)]'
                    }`}
                  />
                  <span className="truncate">Warranty Policy</span>
                </div>
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-[2px] tabular-nums shrink-0 ml-2 ${
                    policy?.status === 'ACTIVE'
                      ? 'bg-[var(--status-success-soft)] text-[var(--status-success)] border border-[var(--status-success-border)]'
                      : policy
                      ? 'bg-[var(--surface-subtle)] text-[var(--text-muted)]'
                      : 'bg-[var(--status-warning-soft)] text-[var(--status-warning)] border border-[var(--status-warning-border)]'
                  }`}
                >
                  {policy?.status === 'ACTIVE'
                    ? `${policy.durationMonths}m`
                    : policy
                    ? 'Inactive'
                    : 'Not Set'}
                </span>
              </button>
            </div>
          </div>

          {/* Persistent Meta / Context Card */}
          <div className="pt-3 border-t border-[var(--border)] text-[12px] space-y-2">
            <div className="flex items-center justify-between text-[var(--text-muted)]">
              <span className="uppercase font-semibold text-[10px] tracking-wider">Product Code</span>
              <span className="font-mono font-bold text-[var(--accent-text)]">{product.productCode}</span>
            </div>
            <div className="flex items-center justify-between text-[var(--text-muted)]">
              <span className="uppercase font-semibold text-[10px] tracking-wider">Tracking</span>
              <span className="font-medium text-[var(--status-success)] text-[11.5px]">Individual Serials</span>
            </div>
            <div className="flex items-center justify-between text-[var(--text-muted)]">
              <span className="uppercase font-semibold text-[10px] tracking-wider">Catalog</span>
              <span className="text-[var(--text-secondary)] font-medium text-[11.5px]">{product.publicVisibility}</span>
            </div>
          </div>
        </aside>

        {/* ======================================================== */}
        {/* 2. RIGHT MAIN CONTENT AREA                               */}
        {/* ======================================================== */}
        <div className="flex-1 min-w-0 w-full space-y-4">

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] p-5 shadow-[0_1px_2px_rgba(23,23,20,0.02)] space-y-4">
            <h2 className="text-[14px] font-semibold text-[var(--text-primary)] pb-2.5 border-b border-[var(--border)] m-0">
              Formulation Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] block mb-1">
                    Short Description
                  </span>
                  <p className="text-[13px] text-[var(--text-primary)] leading-relaxed m-0">
                    {product.shortDescription || 'No short description provided.'}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] block mb-1">
                    Technical Formulation Description
                  </span>
                  <p className="text-[13px] text-[var(--text-primary)] leading-relaxed whitespace-pre-line m-0">
                    {product.description || 'No detailed technical description recorded.'}
                  </p>
                </div>
              </div>

              <div className="bg-[var(--surface-subtle)] border border-[var(--border)] rounded-[3px] p-4 space-y-3 self-start text-[12px]">
                <div>
                  <span className="text-[var(--text-muted)] block text-[10.5px] uppercase font-semibold">Product ID</span>
                  <span className="font-mono text-[var(--text-primary)] break-all">{product.id}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block text-[10.5px] uppercase font-semibold">Product Code</span>
                  <span className="font-mono font-bold text-[var(--accent-text)]">{product.productCode}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block text-[10.5px] uppercase font-semibold">Slug</span>
                  <span className="font-mono text-[var(--text-primary)]">{product.slug}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block text-[10.5px] uppercase font-semibold">Tracking Model</span>
                  <span className="font-semibold text-[var(--status-success)]">Individual Serial Numbers</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block text-[10.5px] uppercase font-semibold">Created At</span>
                  <span className="text-[var(--text-primary)]">{new Date(product.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)] block text-[10.5px] uppercase font-semibold">Last Updated</span>
                  <span className="text-[var(--text-primary)]">{new Date(product.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Warranty Status Banner in Overview */}
            <div className="pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[4px] bg-[var(--surface-subtle)] border border-[var(--border)] flex items-center justify-center text-[var(--accent-text)] shrink-0">
                  <IconShieldCheck className="w-4 h-4" stroke={1.8} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-[var(--text-primary)]">Warranty Policy:</span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-[2px] text-[11px] font-semibold uppercase tracking-wider border ${
                        policy?.status === 'ACTIVE'
                          ? 'bg-[var(--status-success-soft)] text-[var(--status-success)] border-[var(--status-success-border)]'
                          : policy
                          ? 'bg-[var(--status-warning-soft)] text-[var(--status-warning)] border-[var(--status-warning-border)]'
                          : 'bg-[var(--surface-subtle)] text-[var(--text-muted)] border-[var(--border)]'
                      }`}
                    >
                      {policy?.status === 'ACTIVE'
                        ? `${policy.durationMonths} Months (${Math.round((policy.durationMonths / 12) * 10) / 10} yrs)`
                        : policy
                        ? 'Inactive'
                        : 'Not Configured'}
                    </span>
                  </div>
                  <p className="text-[12px] text-[var(--text-secondary)] m-0 mt-0.5">
                    {policy?.status === 'ACTIVE'
                      ? 'Authorized distributors and dealers can register warranty cards for active serial numbers.'
                      : 'Dealers cannot activate warranties until an active policy is configured.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('warranty')}
                className="text-[12px] font-semibold text-[var(--accent-text)] hover:underline self-start sm:self-auto cursor-pointer"
              >
                Manage Policy →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Tracked Serial Numbers */}
      {activeTab === 'serials' && (
        <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] overflow-hidden shadow-[0_1px_3px_rgba(23,23,20,0.03)] space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[var(--border)]">
            <div>
              <h2 className="text-[15px] font-semibold text-[var(--text-primary)] m-0">Tracked Physical Serial Numbers</h2>
              <p className="text-[12.5px] text-[var(--text-secondary)] mt-0.5 m-0">
                Every physical container/unit tracked by its discrete unique serial identifier.
              </p>
            </div>
            <Link
              href="/inventory"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[var(--status-success)] hover:bg-[var(--status-success)] text-[var(--background)] text-[12.5px] font-semibold transition-colors cursor-pointer self-start sm:self-auto"
            >
              + Receive Serials
            </Link>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={serialSearch}
                onChange={(e) => setSerialSearch(e.target.value)}
                placeholder="Search serial number (e.g. TRX-...) or location..."
                className="w-full px-3.5 py-1.5 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              />
            </div>
            <select
              value={serialStatusFilter}
              onChange={(e) => setSerialStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] w-full sm:w-auto"
            >
              <option value="ALL">All Statuses ({serials.length})</option>
              <option value="AVAILABLE">AVAILABLE ({serials.filter((s) => s.status === 'AVAILABLE').length})</option>
              <option value="TRANSFERRED">TRANSFERRED ({serials.filter((s) => s.status === 'TRANSFERRED').length})</option>
              <option value="INACTIVE">INACTIVE ({serials.filter((s) => s.status === 'INACTIVE').length})</option>
            </select>
          </div>

          {filteredSerials.length === 0 ? (
            <ProductEmptyState
              kind="registry"
              title={serials.length === 0 ? 'No physical serials tracked' : 'No matching serials found'}
              description={
                serials.length === 0
                  ? 'Physical container units for this formula have not been received into warehouse inventory yet.'
                  : 'Try clearing your search query or adjusting your status filter.'
              }
            />
          ) : (
            <div className="overflow-x-auto border border-[var(--border)] rounded-[3px]">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-subtle)] text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    <th className="py-2.5 px-4 w-40">Serial Number</th>
                    <th className="py-2.5 px-4">Current Location</th>
                    <th className="py-2.5 px-4 text-center w-28">Status</th>
                    <th className="py-2.5 px-4 w-32">Received On</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredSerials.map((s) => (
                    <tr key={s.id} className="hover:bg-[var(--surface-subtle)] transition-colors">
                      <td className="py-2.5 px-4 font-mono font-medium text-[12px] text-[var(--text-primary)]">
                        {s.serialNumber}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="font-medium text-[13px] text-[var(--text-primary)] block">{s.location?.name}</span>
                        <span className="font-mono text-[11px] text-[var(--text-muted)]">{s.location?.code}</span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="py-2.5 px-4 text-[var(--text-muted)] text-[12px] whitespace-nowrap">
                        {new Date(s.receivedAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-2.5 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setLookupInitialSerial(s.serialNumber);
                            setShowLookupModal(true);
                          }}
                          className="text-[12.5px] font-medium text-[var(--accent-text)] hover:underline cursor-pointer"
                        >
                          History
                        </button>
                        {canWrite && (
                          <button
                            type="button"
                            onClick={() => {
                              setAdjustTargetSerial(s);
                              setAdjustNewStatus(s.status === 'AVAILABLE' ? 'INACTIVE' : 'AVAILABLE');
                              setAdjustReason('Physical inspection variance / condition change');
                              setAdjustNotes('');
                              setAdjustError(null);
                            }}
                            className="inline-flex items-center px-2.5 py-1 rounded border border-[var(--border)] bg-[var(--surface-raised)] hover:bg-[var(--surface-subtle)] text-[var(--accent-text)] text-[11.5px] font-semibold transition-colors cursor-pointer"
                          >
                            Adjust Status
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Specifications */}
      {activeTab === 'specs' && (
        <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] p-6 shadow-[0_1px_3px_rgba(23,23,20,0.03)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div>
              <h2 className="text-[15px] font-semibold text-[var(--text-primary)] m-0">Technical Specifications</h2>
              <p className="text-[12.5px] text-[var(--text-secondary)] mt-0.5 m-0">
                Key performance parameters, chemical ratings, and application requirements.
              </p>
            </div>
            {canWrite && (
              <Link
                href={`/products/${product.id}/edit`}
                className="text-[12.5px] font-medium text-[var(--accent-text)] hover:underline"
              >
                Edit Specifications →
              </Link>
            )}
          </div>

          {product.specifications.length === 0 ? (
            <ProductEmptyState
              kind="families"
              title="No specifications recorded"
              description="Application coats, curing windows, chemical resistance, and hardness parameters have not been entered yet."
              action={
                canWrite ? (
                  <Link
                    href={`/products/${product.id}/edit`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] bg-[var(--text-primary)] text-[var(--background)] text-[12px] font-semibold hover:opacity-90 transition-opacity"
                  >
                    <IconPlus className="w-3.5 h-3.5" stroke={1.8} />
                    Add Specifications
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {product.specifications.map((spec) => (
                <div
                  key={spec.id || spec.label}
                  className="bg-[var(--surface-subtle)] border border-[var(--border)] rounded-[3px] p-3"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] block mb-1">
                    {spec.label}
                  </span>
                  <span className="text-[13px] font-medium text-[var(--text-primary)]">{spec.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Media & Docs */}
      {activeTab === 'media' && (
        <div className="space-y-6">
          <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] p-5 shadow-[0_1px_2px_rgba(23,23,20,0.02)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <h2 className="text-[14px] font-semibold text-[var(--text-primary)] m-0">Media Assets & Technical Documents</h2>
                <p className="text-[12px] text-[var(--text-secondary)] mt-0.5 m-0">
                  Product imagery, packaging diagrams, Technical Data Sheets (TDS), and Material Safety Data Sheets (MSDS).
                </p>
              </div>
              {canWrite && (
                <button
                  type="button"
                  onClick={() => setShowUploadModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] bg-[var(--text-primary)] hover:opacity-90 text-[var(--background)] text-[12px] font-semibold transition-opacity cursor-pointer"
                >
                  <IconUpload className="w-3.5 h-3.5" stroke={1.8} />
                  Upload File
                </button>
              )}
            </div>

            {product.media.length === 0 ? (
              <ProductEmptyState
                kind="registry"
                title="No media assets or documents"
                description="Upload packaging imagery, Technical Data Sheets (TDS), or Material Safety Data Sheets (MSDS)."
                action={
                  canWrite ? (
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] bg-[var(--text-primary)] text-[var(--background)] text-[12px] font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      <IconUpload className="w-3.5 h-3.5" stroke={1.8} />
                      Upload Document
                    </button>
                  ) : undefined
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {product.media.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[var(--background)] border border-[var(--border)] rounded-[6px] overflow-hidden flex flex-col justify-between"
                  >
                    {item.type === 'IMAGE' ? (
                      <div className="h-44 bg-[var(--surface-subtle)] relative overflow-hidden flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.storagePath}
                          alt={item.altText || item.fileName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-44 bg-[var(--surface-subtle)] flex flex-col items-center justify-center p-4 text-center">
                        <svg className="w-12 h-12 text-[var(--text-secondary)] mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="font-mono text-[11px] font-bold uppercase text-[var(--text-primary)]">
                          {item.mimeType === 'application/pdf' ? 'PDF DOCUMENT' : 'DATA SHEET'}
                        </span>
                      </div>
                    )}

                    <div className="p-3 border-t border-[var(--border)] bg-[var(--surface-raised)]">
                      <span className="block font-medium text-[13px] text-[var(--text-primary)] truncate mb-0.5">
                        {item.fileName}
                      </span>
                      <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                        <span>{(item.fileSize / 1024).toFixed(1)} KB</span>
                        <div className="flex items-center gap-2">
                          <a
                            href={item.storagePath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--accent-text)] hover:underline font-medium"
                          >
                            View
                          </a>
                          {canWrite && (
                            <button
                              type="button"
                              disabled={deletingMediaId === item.id}
                              onClick={() => handleDeleteMedia(item.id)}
                              className="text-[var(--status-danger)] hover:underline cursor-pointer"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Movements */}
      {activeTab === 'movements' && (
        <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] overflow-hidden shadow-[0_1px_3px_rgba(23,23,20,0.03)]">
          <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-[var(--text-primary)] m-0">Serial Movement History</h2>
              <p className="text-[12.5px] text-[var(--text-secondary)] mt-0.5 m-0">
                Immutable audit trail of receipts, facility transfers, and status adjustments for this product.
              </p>
            </div>
            <Link
              href="/inventory/movements"
              className="text-[12.5px] font-medium text-[var(--accent-text)] hover:underline"
            >
              Full Ledger View →
            </Link>
          </div>

          {movements.length === 0 ? (
            <ProductEmptyState
              kind="attention"
              title="No serial movement history"
              description="Units of this formula have not undergone any facility transfers, receipts, or status adjustments yet."
            />
          ) : (
            <div className="overflow-x-auto border border-[var(--border)] rounded-[3px]">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-subtle)] text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    <th className="py-2.5 px-4 w-36">Timestamp</th>
                    <th className="py-2.5 px-4 w-28">Type</th>
                    <th className="py-2.5 px-4 w-40">Serial Number</th>
                    <th className="py-2.5 px-4">Movement Route</th>
                    <th className="py-2.5 px-4">Reason / Reference</th>
                    <th className="py-2.5 px-4 w-32">Operator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {movements.map((m) => (
                    <tr key={m.id} className="hover:bg-[var(--surface-subtle)] transition-colors">
                      <td className="py-2.5 px-4 text-[var(--text-muted)] whitespace-nowrap text-[12px]">
                        {new Date(m.createdAt).toLocaleString(undefined, {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-[2px] text-[11px] font-medium capitalize ${
                            m.type === 'RECEIVED'
                              ? 'bg-[var(--status-success-soft)] text-[var(--status-success)] border border-[var(--status-success-border)]'
                              : m.type === 'TRANSFERRED'
                              ? 'bg-[var(--status-info-soft)] text-[var(--status-info)] border border-[var(--status-info-border)]'
                              : 'bg-[var(--status-warning-soft)] text-[var(--status-warning)] border border-[var(--status-warning-border)]'
                          }`}
                        >
                          {m.type.toLowerCase()}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono font-medium text-[12px] text-[var(--text-primary)]">
                        {m.serialNumber || '—'}
                      </td>
                      <td className="py-2.5 px-4 text-[13px] text-[var(--text-primary)]">
                        {m.fromLocationName ? (
                          <span>
                            {m.fromLocationName} → <strong>{m.toLocationName || 'Facility'}</strong>
                          </span>
                        ) : (
                          <span>Received into <strong>{m.toLocationName || 'Facility'}</strong></span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[var(--text-secondary)] max-w-[200px] truncate">
                        {m.reference && <span className="font-semibold block text-[var(--text-primary)]">{m.reference}</span>}
                        {m.reason || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-[var(--text-secondary)] text-[12px]">
                        {m.actorName || 'Operator'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Warranty Policy */}
      {activeTab === 'warranty' && (
        <div className="space-y-6">
          <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] p-6 shadow-[0_1px_3px_rgba(23,23,20,0.03)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
              <div>
                <h2 className="text-[16px] font-semibold text-[var(--text-primary)] m-0">
                  Product Warranty Policy
                </h2>
                <p className="text-[12.5px] text-[var(--text-secondary)] mt-0.5 m-0">
                  Controls factory warranty eligibility, duration, and dealer activation rules for this product formulation.
                </p>
              </div>

              {canWrite && (
                <button
                  type="button"
                  onClick={() => {
                    setPolicyDuration(policy?.durationMonths ?? 24);
                    setPolicyStatus(policy?.status ?? 'ACTIVE');
                    setPolicyError(null);
                    setShowPolicyModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] bg-[var(--text-primary)] hover:bg-[var(--surface-subtle)] text-[var(--background)] text-[13px] font-medium transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {policy ? 'Edit Warranty Policy' : 'Configure Warranty Policy'}
                </button>
              )}
            </div>

            {policy ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-[6px] border border-[var(--border)] bg-[var(--background)]">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                        Policy Status
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-[4px] text-[12px] font-bold tracking-wide uppercase border ${
                            policy.status === 'ACTIVE'
                              ? 'bg-[var(--status-success-soft)] text-[var(--status-success)] border-[var(--status-success-border)]'
                              : 'bg-[var(--status-warning-soft)] text-[var(--status-warning)] border-[var(--status-warning-border)]'
                          }`}
                        >
                          {policy.status}
                        </span>
                        <span className="text-[12px] text-[var(--text-secondary)]">
                          {policy.status === 'ACTIVE'
                            ? 'Dealers can activate warranties'
                            : 'Activations currently paused'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-[6px] border border-[var(--border)] bg-[var(--background)]">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                        Standard Warranty Duration
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-[22px] font-bold text-[var(--text-primary)]">
                          {policy.durationMonths}
                        </span>
                        <span className="text-[13px] text-[var(--text-secondary)] font-medium">
                          months ({Math.round((policy.durationMonths / 12) * 10) / 10} {policy.durationMonths === 12 ? 'year' : 'years'})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-[6px] border border-[var(--border)] bg-[var(--background)] space-y-2">
                    <h3 className="text-[13px] font-bold uppercase tracking-wider text-[var(--text-secondary)] m-0">
                      Standard Terms & Coverage
                    </h3>
                    <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed m-0">
                      Standard factory warranty covers manufacturing defects, formulation integrity, adhesion performance, and environmental degradation when applied according to official Trionyx surface preparation protocol by an authorized dealer.
                    </p>
                    <p className="text-[12px] text-[var(--text-muted)] m-0 pt-1">
                      Warranty period begins strictly from the documented <strong>Installation Date</strong> entered during registration.
                    </p>
                  </div>
                </div>

                <div className="bg-[var(--background)] border border-[var(--border)] rounded-[6px] p-4 space-y-3 self-start text-[12.5px]">
                  <div>
                    <span className="text-[var(--text-muted)] block text-[11px] uppercase font-semibold">Policy ID</span>
                    <span className="font-mono text-[var(--text-primary)] break-all">{policy.id}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block text-[11px] uppercase font-semibold">Product Code</span>
                    <span className="font-mono font-bold text-[var(--accent-text)]">{product.productCode}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block text-[11px] uppercase font-semibold">Configured</span>
                    <span className="text-[var(--text-primary)]">{new Date(policy.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block text-[11px] uppercase font-semibold">Last Modified</span>
                    <span className="text-[var(--text-primary)]">{new Date(policy.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-[var(--border-strong)] rounded-[8px] bg-[var(--background)] space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-[var(--surface-subtle)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)]">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-[var(--text-primary)] m-0">
                    No Warranty Policy Configured
                  </h3>
                  <p className="text-[13px] text-[var(--text-secondary)] max-w-md mx-auto mt-1 m-0">
                    Dealers cannot register or activate warranties for serial numbers of this product until a duration policy is established.
                  </p>
                </div>
                {canWrite && (
                  <button
                    type="button"
                    onClick={() => {
                      setPolicyDuration(24);
                      setPolicyStatus('ACTIVE');
                      setPolicyError(null);
                      setShowPolicyModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-foreground)] text-[13px] font-semibold transition-colors cursor-pointer"
                  >
                    Configure Policy Now
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

        </div>
      </div>

      {/* Archive Product Confirmation Modal */}
      <ConfirmDialog
        isOpen={showArchiveDialog}
        title="Archive Product"
        description={`Are you sure you want to archive "${product.name}" (${product.productCode})? It will be marked as ARCHIVED and deactivated from public catalog views. Historical serial number records and movement audits will be preserved.`}
        confirmLabel="Yes, Archive Product"
        isDestructive
        isLoading={isArchiving}
        onConfirm={handleArchive}
        onClose={() => setShowArchiveDialog(false)}
      />

      {/* Serial Status Adjustment Modal */}
      <Modal
        isOpen={!!adjustTargetSerial}
        onClose={() => setAdjustTargetSerial(null)}
        title={`Adjust Status for Serial #${adjustTargetSerial?.serialNumber}`}
      >
        <form onSubmit={handleAdjustStatusSubmit} className="space-y-4">
          {adjustError && (
            <div className="p-3 rounded bg-[var(--status-danger-soft)] border border-[var(--status-danger-border)] text-[var(--status-danger)] text-[13px]">
              {adjustError}
            </div>
          )}

          <div>
            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Serial Number
            </label>
            <input
              type="text"
              readOnly
              value={adjustTargetSerial?.serialNumber || ''}
              className="w-full px-3 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] font-mono font-bold text-[13.5px]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Target Status *
            </label>
            <select
              value={adjustNewStatus}
              onChange={(e) => setAdjustNewStatus(e.target.value as SerialStatus)}
              className="w-full px-3 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              <option value="AVAILABLE">AVAILABLE (Active Stock)</option>
              <option value="INACTIVE">INACTIVE (Decommissioned / Damaged / QA hold)</option>
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Mandatory Audit Reason *
            </label>
            <input
              type="text"
              required
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder="e.g. Broken seal detected during pre-shipment inspection"
              className="w-full px-3.5 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
            <p className="text-[11.5px] text-[var(--text-muted)] mt-1 m-0">
              Audit log will permanently record this reason against the serial movement ledger.
            </p>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Additional Notes (Optional)
            </label>
            <input
              type="text"
              value={adjustNotes}
              onChange={(e) => setAdjustNotes(e.target.value)}
              placeholder="e.g. Transferred to containment bay 3"
              className="w-full px-3 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setAdjustTargetSerial(null)}
              className="px-4 py-2 rounded-[6px] border border-[var(--border)] hover:bg-[var(--background)] text-[var(--text-primary)] text-[13px] font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAdjusting || !adjustReason.trim()}
              className="px-4 py-2 rounded-[6px] bg-[var(--text-primary)] hover:bg-[var(--surface-subtle)] disabled:opacity-50 text-[var(--background)] text-[13px] font-semibold transition-colors cursor-pointer"
            >
              {isAdjusting ? 'Saving...' : 'Update Status'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Upload Media Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Product Media / Document"
      >
        <form onSubmit={handleFileUpload} className="space-y-4">
          {uploadError && (
            <div className="p-3 rounded bg-[var(--status-danger-soft)] border border-[var(--status-danger-border)] text-[var(--status-danger)] text-[13px]">
              {uploadError}
            </div>
          )}

          <div>
            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Select File *
            </label>
            <input
              type="file"
              required
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp,image/svg+xml,application/pdf,text/csv"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setUploadFile(e.target.files[0]);
                }
              }}
              className="w-full text-[13px] text-[var(--text-primary)] file:mr-4 file:py-2 file:px-4 file:rounded-[6px] file:border-0 file:text-[13px] file:font-semibold file:bg-[var(--text-primary)] file:text-[var(--background)] hover:file:bg-[var(--surface-subtle)]"
            />
            <p className="text-[11.5px] text-[var(--text-muted)] mt-1 m-0">
              Allowed: JPG, PNG, WebP, SVG (up to 5MB) or PDF, CSV (up to 10MB).
            </p>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Alt Text / Title (Optional)
            </label>
            <input
              type="text"
              value={uploadAltText}
              onChange={(e) => setUploadAltText(e.target.value)}
              placeholder="e.g. Front bottle packaging or Technical Data Sheet v2"
              className="w-full px-3.5 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setShowUploadModal(false)}
              className="px-4 py-2 rounded-[6px] border border-[var(--border)] hover:bg-[var(--background)] text-[var(--text-primary)] text-[13px] font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !uploadFile}
              className="px-4 py-2 rounded-[6px] bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-[var(--accent-foreground)] text-[13px] font-medium transition-colors cursor-pointer"
            >
              {isUploading ? 'Uploading...' : 'Confirm Upload'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Global Interactive Serial Number Lookup Modal */}
      <SerialNumberLookupModal
        isOpen={showLookupModal}
        initialSerialNumber={lookupInitialSerial}
        onClose={() => {
          setShowLookupModal(false);
          setLookupInitialSerial(undefined);
        }}
      />

      {/* Warranty Policy Configuration Modal */}
      <Modal
        isOpen={showPolicyModal}
        onClose={() => setShowPolicyModal(false)}
        title={policy ? `Edit Warranty Policy — ${product.productCode}` : `Configure Warranty Policy — ${product.productCode}`}
        subtitle={`Set factory warranty terms for ${product.name}`}
      >
        <form onSubmit={handleSaveWarrantyPolicy} className="space-y-5">
          {policyError && (
            <div className="p-3 rounded bg-[var(--status-danger-soft)] border border-[var(--status-danger-border)] text-[var(--status-danger)] text-[13px]">
              {policyError}
            </div>
          )}

          <div>
            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Warranty Duration (Months) *
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={120}
                required
                value={policyDuration}
                onChange={(e) => setPolicyDuration(parseInt(e.target.value, 10) || 1)}
                className="w-32 px-3.5 py-2 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-[14px] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              />
              <span className="text-[13px] text-[var(--text-secondary)]">
                months ({Math.round((policyDuration / 12) * 10) / 10} years)
              </span>
            </div>

            {/* Quick preset buttons */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {[
                { label: '12m (1 yr)', value: 12 },
                { label: '24m (2 yrs)', value: 24 },
                { label: '36m (3 yrs)', value: 36 },
                { label: '60m (5 yrs)', value: 60 },
                { label: '120m (10 yrs)', value: 120 },
              ].map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setPolicyDuration(preset.value)}
                  className={`px-2.5 py-1 text-[11.5px] rounded-[4px] border transition-colors cursor-pointer ${
                    policyDuration === preset.value
                      ? 'bg-[var(--accent)] text-[var(--accent-foreground)] border-[var(--accent)] font-semibold'
                      : 'border-[var(--border)] hover:bg-[var(--background)] text-[var(--text-secondary)]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Policy Status *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-start gap-2.5 p-3 rounded-[6px] border cursor-pointer transition-colors ${
                  policyStatus === 'ACTIVE'
                    ? 'border-[var(--status-success)] bg-[var(--status-success-soft)]'
                    : 'border-[var(--border)] hover:bg-[var(--background)]'
                }`}
              >
                <input
                  type="radio"
                  name="policyStatus"
                  value="ACTIVE"
                  checked={policyStatus === 'ACTIVE'}
                  onChange={() => setPolicyStatus('ACTIVE')}
                  className="mt-0.5"
                />
                <div>
                  <span className="text-[13px] font-semibold text-[var(--text-primary)] block">Active</span>
                  <span className="text-[11.5px] text-[var(--text-secondary)] block mt-0.5">
                    Dealers can activate warranties for this product.
                  </span>
                </div>
              </label>

              <label
                className={`flex items-start gap-2.5 p-3 rounded-[6px] border cursor-pointer transition-colors ${
                  policyStatus === 'INACTIVE'
                    ? 'border-[var(--status-warning)] bg-[var(--status-warning-soft)]'
                    : 'border-[var(--border)] hover:bg-[var(--background)]'
                }`}
              >
                <input
                  type="radio"
                  name="policyStatus"
                  value="INACTIVE"
                  checked={policyStatus === 'INACTIVE'}
                  onChange={() => setPolicyStatus('INACTIVE')}
                  className="mt-0.5"
                />
                <div>
                  <span className="text-[13px] font-semibold text-[var(--text-primary)] block">Inactive</span>
                  <span className="text-[11.5px] text-[var(--text-secondary)] block mt-0.5">
                    Blocks dealer registrations. Existing warranties remain valid.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setShowPolicyModal(false)}
              className="px-4 py-2 rounded-[6px] border border-[var(--border)] hover:bg-[var(--background)] text-[var(--text-primary)] text-[13px] font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingPolicy}
              className="px-4 py-2 rounded-[6px] bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-[var(--accent-foreground)] text-[13px] font-semibold transition-colors cursor-pointer"
            >
              {isSavingPolicy ? 'Saving Policy...' : 'Save Warranty Policy'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
