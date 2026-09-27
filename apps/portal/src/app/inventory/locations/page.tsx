import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireInternalUser, AUTH_CONFIG } from '@trionyx/auth';
import {
  locationsRepository,
  ensureDatabaseReady,
  getDbClient,
} from '@trionyx/database';
import { InternalShell } from '../../../components/shell/InternalShell';
import { LocationsTable, type LocationWithStats } from './LocationsTable';

export const dynamic = 'force-dynamic';

export default async function LocationsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;

  let authData;
  try {
    authData = await requireInternalUser(token);
  } catch {
    redirect('/login');
  }

  const { user } = authData;

  await ensureDatabaseReady();

  const db = getDbClient();
  const [rawLocations, statsResult] = await Promise.all([
    locationsRepository.list(),
    db.execute(`
      SELECT
        location_id,
        COUNT(DISTINCT product_id) as product_count,
        COUNT(CASE WHEN status = 'AVAILABLE' THEN 1 END) as available_count,
        COUNT(id) as total_count
      FROM serial_numbers
      GROUP BY location_id
    `),
  ]);

  const statsMap = new Map<string, { productCount: number; availableUnits: number; totalSerials: number }>();
  for (const row of statsResult.rows) {
    if (row.location_id) {
      statsMap.set(String(row.location_id), {
        productCount: Number(row.product_count ?? 0),
        availableUnits: Number(row.available_count ?? 0),
        totalSerials: Number(row.total_count ?? 0),
      });
    }
  }

  const locations: LocationWithStats[] = rawLocations.map((loc) => {
    const stats = statsMap.get(loc.id) || { productCount: 0, availableUnits: 0, totalSerials: 0 };
    return {
      ...loc,
      productCount: stats.productCount,
      availableUnits: stats.availableUnits,
      totalSerials: stats.totalSerials,
    };
  });

  return (
    <InternalShell user={user}>
      <LocationsTable locations={locations} user={user} />
    </InternalShell>
  );
}
