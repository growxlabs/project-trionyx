'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { Organization, OrganizationMembership } from '@trionyx/types';

const ACTIVE_ORG_COOKIE_NAME = 'trionyx_active_org';

interface OrgContextValue {
  activeOrg: Organization | null;
  membership: OrganizationMembership | null;
  memberships: OrganizationMembership[];
  isLoading: boolean;
  switchingOrganizationId: string | null;
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
  const router = useRouter();
  const pathname = usePathname();

  const [activeOrg, setActiveOrg] = useState<Organization | null>(initialActiveOrg || null);
  const [membership, setMembership] = useState<OrganizationMembership | null>(initialMembership || null);
  const [memberships, setMemberships] = useState<OrganizationMembership[]>(initialMemberships);
  const [isLoading, setIsLoading] = useState<boolean>(!initialActiveOrg);
  const [isRefreshing, startRefresh] = useTransition();
  const [switchingOrganizationId, setSwitchingOrganizationId] = useState<string | null>(null);

  // Sync state if SSR props change on server component re-renders
  useEffect(() => {
    if (initialActiveOrg) {
      setActiveOrg(initialActiveOrg);
    }
  }, [initialActiveOrg?.id]);

  useEffect(() => {
    if (initialMembership) {
      setMembership(initialMembership);
    }
  }, [initialMembership?.id]);

  useEffect(() => {
    if (initialMemberships && initialMemberships.length > 0) {
      setMemberships(initialMemberships);
    }
  }, [initialMemberships]);

  useEffect(() => {
    // If not supplied via SSR or if empty, fetch from API
    if (!initialActiveOrg) {
      let isMounted = true;
      fetch('/api/v1/internal/auth/organizations')
        .then((res) => res.json())
        .then((resData) => {
          if (!isMounted) return;
          const payload = resData?.data || (resData?.success ? resData.data : null);
          if (payload) {
            if (payload.activeOrg) setActiveOrg(payload.activeOrg);
            if (payload.membership) setMembership(payload.membership);
            if (payload.memberships) setMemberships(payload.memberships || []);
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
    if (switchingOrganizationId || isRefreshing) return;
    setSwitchingOrganizationId(orgIdOrSlug);
    setIsLoading(true);

    try {
      const res = await fetch('/api/v1/internal/auth/switch-org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: orgIdOrSlug }),
      });
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData?.error?.message || 'Failed to switch organization');
      }

      const payload = resData?.data || (resData?.success ? resData.data : null);
      const newActiveOrg = payload?.activeOrg;
      const newMembership = payload?.membership;
      const newMemberships = payload?.memberships;

      if (!newActiveOrg) {
        throw new Error('Invalid organization response from server');
      }

      // 1. Immediately update client state
      setActiveOrg(newActiveOrg);
      if (newMembership) setMembership(newMembership);
      if (newMemberships && newMemberships.length > 0) setMemberships(newMemberships);

      // 2. Client-side cookie sync for instant consistency
      try {
        const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
        document.cookie = `${ACTIVE_ORG_COOKIE_NAME}=${encodeURIComponent(newActiveOrg.id)}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax${isSecure ? '; Secure' : ''}`;
      } catch {
        // Ignore cookie access limitations in restricted environments
      }

      // 3. Handle route transitions: warranty is strictly Trionyx-only
      startRefresh(() => {
        if (pathname.startsWith('/warranty') && newActiveOrg.slug !== 'trionyx') {
          router.replace('/overview');
        } else {
          router.refresh();
        }
      });
    } finally {
      setIsLoading(false);
      setSwitchingOrganizationId(null);
    }
  }, [pathname, router, switchingOrganizationId, isRefreshing]);

  return (
    <OrgContext.Provider
      value={{
        activeOrg,
        membership,
        memberships,
        isLoading: isLoading || isRefreshing,
        switchingOrganizationId,
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
      switchingOrganizationId: null,
      switchOrg: async () => {},
    };
  }
  return context;
}

