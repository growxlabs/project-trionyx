import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireInternalUser, AUTH_CONFIG } from '@trionyx/auth';
import {
  dealersRepository,
  productsRepository,
  serialsRepository,
  contactEnquiriesRepository,
  warrantiesRepository,
  auditLogsRepository,
  usersRepository,
  ensureDatabaseReady,
} from '@trionyx/database';
import { getServerActiveOrg } from '@/lib/serverOrg';
import { InternalShell } from '../../components/shell/InternalShell';

import { OverviewCockpit } from './OverviewCockpit';

export const dynamic = 'force-dynamic';

export default async function OverviewPage() {
  let authData;
  try {
    authData = await getServerActiveOrg();
  } catch {
    redirect('/login');
  }

  const { user, activeOrg } = authData;
  await ensureDatabaseReady();

  const isTrionyx = activeOrg.slug === 'trionyx';

  // Authoritative operational queries across all ERP master tables
  const [
    dealersRes,
    productsRes,
    inventorySummaries,
    enquiriesRes,
    warrantiesRes,
    auditLogs,
    allUsers,
  ] = await Promise.all([
    dealersRepository.list({ limit: 500, organizationId: activeOrg.id }),
    productsRepository.list({ limit: 500, organizationId: activeOrg.id }),
    serialsRepository.listProductInventorySummaries({ organizationId: activeOrg.id }).catch(() => []),
    contactEnquiriesRepository.list({ limit: 500, organizationId: activeOrg.id }).catch(() => ({ items: [], total: 0 })),
    isTrionyx ? warrantiesRepository.list({ limit: 500 }).catch(() => ({ items: [], total: 0 })) : Promise.resolve({ items: [], total: 0 }),
    auditLogsRepository.list({ limit: 14, organizationId: activeOrg.id }),
    usersRepository.listInternalUsers().catch(() => []),
  ]);

  // Derived metrics
  const activeDealers = dealersRes.items.filter((d) => d.status === 'ACTIVE').length;
  const unassignedDealers = dealersRes.items
    .filter((d) => !d.distributorId)
    .map((d) => ({
      id: d.id,
      dealerCode: d.dealerCode,
      businessName: d.businessName,
      city: d.city,
      state: d.state,
      status: d.status,
    }));

  const availableUnits = inventorySummaries.reduce((sum, s) => sum + s.availableCount, 0);
  const outOfStockProducts = inventorySummaries
    .filter((s) => s.availableCount === 0)
    .map((s) => ({
      productId: s.productId,
      productCode: s.productCode,
      productName: s.productName,
      categoryName: s.categoryName,
      availableCount: s.availableCount,
    }));

  const newEnquiriesList = enquiriesRes.items
    .filter((e) => e.status === 'NEW')
    .map((e) => ({
      id: e.id,
      enquiryCode: e.enquiryCode,
      fullName: e.fullName,
      companyName: e.companyName,
      type: e.type,
      city: e.city,
      createdAt: e.createdAt,
    }));

  const voidWarranties = warrantiesRes.items.filter((w) => w.status === 'VOID').length;
  const totalWarranties = warrantiesRes.items.length;

  const userMap = new Map(allUsers.map((u) => [u.id, u.name]));

  // Document journal stream
  const activities = auditLogs.map((log) => {
    const dateObj = new Date(log.createdAt);
    const timeFormatted = dateObj.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata',
    });

    let recordLabel = 'SYS_EVENT';
    let recordHref: string | undefined = undefined;

    if (log.metadata) {
      try {
        const meta = JSON.parse(log.metadata);
        if (meta.productCode || meta.productName) {
          recordLabel = meta.productCode || meta.productName;
          if (meta.productId) recordHref = `/products/${meta.productId}`;
        } else if (meta.dealerCode || meta.businessName) {
          recordLabel = meta.dealerCode || meta.businessName;
          if (meta.dealerId) recordHref = `/dealers/${meta.dealerId}`;
        } else if (meta.enquiryCode) {
          recordLabel = meta.enquiryCode;
          if (meta.enquiryId) recordHref = `/enquiries/${meta.enquiryId}`;
        } else if (meta.serialNumber) {
          recordLabel = meta.serialNumber;
        } else if (meta.email) {
          recordLabel = meta.email;
        }
      } catch {
        // ignore
      }
    }

    const actor = log.userId ? userMap.get(log.userId) || 'OPERATOR' : 'SYSTEM';

    return {
      id: log.id,
      time: timeFormatted,
      event: log.event,
      record: recordLabel,
      recordHref,
      actor,
    };
  });

  const scorecardRows = [
    {
      label: 'Authorized Detailing Studios',
      balance: activeDealers,
      unit: 'studios',
      status: 'Normal',
      statusType: 'success' as const,
      href: '/dealers',
      linkText: 'Studio Registry →',
    },
    {
      label: 'Physical Serial Inventory',
      balance: availableUnits,
      unit: 'bottles',
      status: 'Critical low',
      statusType: 'danger' as const,
      href: '/inventory',
      linkText: 'Stock Ledger →',
    },
    {
      label: 'Registered Chemical Formulas',
      balance: productsRes.length,
      unit: 'formulas',
      status: 'Stable',
      statusType: 'neutral' as const,
      href: '/products',
      linkText: 'Product Master →',
    },
    {
      label: 'Inbound Partner Enquiries',
      balance: newEnquiriesList.length,
      unit: 'pending',
      status: 'Requires triage',
      statusType: 'warning' as const,
      href: '/enquiries',
      linkText: 'Open Queue →',
    },
    {
      label: 'Warranty Policies Under Coverage',
      balance: totalWarranties,
      unit: 'registered',
      status: 'Audited',
      statusType: 'success' as const,
      href: '/warranty',
      linkText: 'Warranty Book →',
    },
  ];

  const facilityStats = {
    availableUnits,
    outOfStockCount: outOfStockProducts.length,
    catalogSkus: productsRes.length,
  };

  return (
    <InternalShell user={user}>
      <OverviewCockpit
        scorecardRows={scorecardRows}
        activities={activities}
        outOfStockProducts={outOfStockProducts}
        unassignedDealers={unassignedDealers}
        newEnquiriesList={newEnquiriesList}
        facilityStats={facilityStats}
      />
    </InternalShell>
  );
}
