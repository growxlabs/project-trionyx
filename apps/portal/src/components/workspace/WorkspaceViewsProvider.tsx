'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { WorkspaceSidebar, type WorkspaceViewsConfig } from './WorkspaceSidebar';

type RegisterFn = (config: WorkspaceViewsConfig | null) => void;

const WorkspaceViewsContext = createContext<RegisterFn | null>(null);

/**
 * Shell-level host for the secondary "Workspace Views" sidebar. Pages register
 * their views with `useRegisterWorkspaceViews`; the sidebar renders beside the
 * page content so it reads as a real second sidebar rather than an in-page card.
 */
export function WorkspaceViewsProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<WorkspaceViewsConfig | null>(null);

  return (
    <WorkspaceViewsContext.Provider value={setConfig}>
      <div className="flex-1 flex min-h-0 w-full">
        {config ? <WorkspaceSidebar {...config} /> : null}
        <div className="flex-1 min-w-0 flex flex-col min-h-0">
          <main className="flex-1 min-w-0 px-4 py-4 sm:px-6 sm:py-5 lg:px-7 lg:py-5">
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
