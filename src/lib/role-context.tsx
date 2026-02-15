'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Role = 'admin' | 'instructor' | 'student';

interface RoleState {
  role: Role | null;
  profileId: string | null;
}

interface RoleContextType extends RoleState {
  setRole: (role: Role, profileId?: string | null) => void;
  clearRole: () => void;
  isReady: boolean;
}

const RoleContext = createContext<RoleContextType>({
  role: null,
  profileId: null,
  setRole: () => {},
  clearRole: () => {},
  isReady: false,
});

export function useRole() {
  return useContext(RoleContext);
}

const STORAGE_KEY = 'mlb_role';

export function RoleProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RoleState>({ role: null, profileId: null });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setState({ role: parsed.role || null, profileId: parsed.profileId || null });
      }
    } catch {}
    setIsReady(true);
  }, []);

  const setRole = (role: Role, profileId?: string | null) => {
    const newState = { role, profileId: profileId ?? null };
    setState(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  };

  const clearRole = () => {
    setState({ role: null, profileId: null });
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <RoleContext.Provider value={{ ...state, setRole, clearRole, isReady }}>
      {children}
    </RoleContext.Provider>
  );
}
