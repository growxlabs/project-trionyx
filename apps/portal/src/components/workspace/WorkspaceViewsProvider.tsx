'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { WorkspaceSidebar, type WorkspaceViewsConfig } from './WorkspaceSidebar';
import { cn } from '@/lib/utils';

type RegisterFn = (config: WorkspaceViewsConfig | null) => void;

const WorkspaceViewsContext = createContext<RegisterFn | null>(null);

/**
 * Shell-level host for the secondary "Workspace Views" sidebar. Pages register
 * their views with `useRegisterWorkspaceViews`; the sidebar renders beside the
 * page content so it reads as a real second sidebar rather than an in-page card.
 */
export function WorkspaceViewsProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<WorkspaceViewsConfig | null>(null);
  const pathname = usePathname();
  const isTrix = pathname?.startsWith('/trix');

  return (
    <WorkspaceViewsContext.Provider value={setConfig}>
      <div className={cn('flex-1 flex min-h-0 min-w-0 w-full', isTrix && 'h-full overflow-hidden')}>
        {config ? <WorkspaceSidebar {...config} /> : null}
        <div className={cn('flex-1 min-w-0 flex flex-col min-h-0', isTrix && 'h-full overflow-hidden')}>
          <main
            className={cn(
              'flex-1 min-w-0 min-h-0',
              isTrix ? 'h-full p-0 flex flex-col overflow-hidden' : 'px-4 py-4 sm:px-6 sm:py-5 lg:px-7 lg:py-5'
            )}
          >
            {children}
          </main>
        </div>
      </div>
    </WorkspaceViewsContext.Provider>
  );
}

export function useRegisterWorkspaceViews(config: WorkspaceViewsConfig | null) {
  const register = useContext(WorkspaceViewsContext);

  useEffect(() => {
    if (!register) return;
    register(config);
  }, [register, config]);

  useEffect(() => {
    if (!register) return;
    return () => register(null);
  }, [register]);
}
