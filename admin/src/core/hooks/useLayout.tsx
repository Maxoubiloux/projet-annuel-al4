import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface LayoutContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  collapsed: boolean;
  toggleCollapsed: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('layout_theme') as 'light' | 'dark') ?? 'light'
  );
  const [collapsed, setCollapsed] = useState<boolean>(
    () => localStorage.getItem('layout_collapsed') === 'true'
  );

  useEffect(() => {
    localStorage.setItem('layout_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('layout_collapsed', String(collapsed));
  }, [collapsed]);

  return (
    <LayoutContext.Provider value={{
      theme,
      toggleTheme: () => setTheme(t => t === 'light' ? 'dark' : 'light'),
      collapsed,
      toggleCollapsed: () => setCollapsed(c => !c),
    }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayout must be used within LayoutProvider');
  return ctx;
}
