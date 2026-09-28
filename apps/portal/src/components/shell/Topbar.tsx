import React from 'react';
import type { SafeUser } from '@trionyx/types';
import { UserMenu } from './UserMenu';

interface TopbarProps {
  user: SafeUser;
}

export function Topbar({ user }: TopbarProps) {
  return (
    <header className="hidden lg:flex items-center justify-end h-14 px-8 border-b border-[var(--border)] bg-[var(--surface-raised)] sticky top-0 z-30 select-none">
      {/* Primary Account Control */}
      <UserMenu user={user} />
    </header>
  );
}
