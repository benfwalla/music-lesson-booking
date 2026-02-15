'use client';

import { ReactNode, useEffect } from 'react';
import { RoleProvider, useRole } from '@/lib/role-context';
import { RolePicker } from '@/components/role-picker';
import { Nav } from '@/components/nav';
import { seedInstructors } from '@/lib/store';

function ShellInner({ children }: { children: ReactNode }) {
  const { role, isReady } = useRole();

  useEffect(() => {
    seedInstructors();
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!role) {
    return <RolePicker />;
  }

  return (
    <div className="flex min-h-screen">
      <Nav />
      <main className="ml-56 flex-1 max-w-6xl px-8 py-8">
        {children}
      </main>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <RoleProvider>
      <ShellInner>{children}</ShellInner>
    </RoleProvider>
  );
}
