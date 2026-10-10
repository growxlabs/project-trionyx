'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Organization, OrganizationMembership } from '@trionyx/types';

interface OrgContextValue {
  activeOrg: Organization | null;
  membership: OrganizationMembership | null;
  memberships: OrganizationMembership[];
  isLoading: boolean;
  switchOrg: (orgIdOrSlug: string) => Promise<void>;
}

const OrgContext = createContext<OrgContextValue | undefined>(undefined);

export function OrgProvider({
  initialActiveOrg,
  initialMembership,
  initialMemberships = [],
  children,
}: {
  initialActiveOrg?: Organization;
  initialMembership?: OrganizationMembership;
  initialMemberships?: OrganizationMembership[];
  children: React.ReactNode;
}) {
  const [activeOrg, setActiveOrg] = useState<Organization | null>(initialActiveOrg || null);
  const [membership, setMembership] = useState<OrganizationMembership | null>(initialMembership || null);
  const [memberships, setMemberships] = useState<OrganizationMembership[]>(initialMemberships);
  const [isLoading, setIsLoading] = useState<boolean>(!initialActiveOrg);

  useEffect(() => {
    // If not supplied via SSR or if empty, fetch from API
    if (!initialActiveOrg) {
      let isMounted = true;
      fetch('/api/v1/internal/auth/organizations')
        .then((res) => res.json())
        .then((data) => {
          if (!isMounted) return;
          if (data?.success && data?.data) {
            setActiveOrg(data.data.activeOrg);
            setMembership(data.data.membership);
            setMemberships(data.data.memberships || []);
          }
        })
        .catch(() => {})
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [initialActiveOrg]);

  const switchOrg = useCallback(async (orgIdOrSlug: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/internal/auth/switch-org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: orgIdOrSlug }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error?.message || 'Failed to switch organization');
      }
      // Reload current page to refresh all server components and SSR queries with the new active org
      window.location.reload();
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  }, []);

  return (
    <OrgContext.Provider
      value={{
        activeOrg,
        membership,
        memberships,
        isLoading,
        switchOrg,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
}

export function useActiveOrg(): OrgContextValue {
  const context = useContext(OrgContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      activeOrg: null,
      membership: null,
      memberships: [],
      isLoading: false,
      switchOrg: async () => {},
    };
  }
  return context;
}
