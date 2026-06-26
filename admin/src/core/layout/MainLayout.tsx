import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { LayoutProvider, useLayout } from '@/core/hooks/useLayout';

function LayoutInner() {
  const { theme } = useLayout();

  return (
    <div
      data-theme={theme}
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        background: 'var(--bg)',
        color: 'var(--ink)',
        fontFamily: "'Geist', system-ui, sans-serif",
        WebkitFontSmoothing: 'antialiased',
        overflow: 'hidden',
      }}
    >
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header />
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 26px 40px',
          }}
        >
          <div style={{ maxWidth: 1320, margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export function MainLayout() {
  return (
    <LayoutProvider>
      <LayoutInner />
    </LayoutProvider>
  );
}
