import { useLocation } from 'react-router-dom';
import { PanelLeft, Search, Sun, Moon, Bell, ChevronDown, ChevronRight } from 'lucide-react';
import { useLayout } from '@/core/hooks/useLayout';
import { useAuth } from '@/core/auth/AuthContext';

const breadcrumbs: Record<string, string> = {
  '/': 'Dashboard',
  '/motos': 'Fleet',
  '/reservations': 'Reservations',
  '/customers': 'Customers',
  '/payments': 'Payments',
  '/maintenance': 'Maintenance',
  '/settings': 'Settings',
};

export function Header() {
  const { theme, toggleTheme, toggleCollapsed } = useLayout();
  const { user } = useAuth();
  const location = useLocation();
  const crumb = breadcrumbs[location.pathname] ?? 'Dashboard';
  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AM';

  const iconBtn: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 34, height: 34,
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    borderRadius: 9, color: 'var(--muted)',
    cursor: 'pointer', flexShrink: 0,
  };

  return (
    <header style={{
      height: 60, flexShrink: 0,
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '0 22px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--surface)',
    }}>
      <button onClick={toggleCollapsed} style={iconBtn}>
        <PanelLeft size={16} strokeWidth={1.6} />
      </button>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--faint)' }}>
        <span>Yard</span>
        <ChevronRight size={12} style={{ color: 'var(--border-2)' }} />
        <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{crumb}</span>
      </div>

      {/* Search */}
      <div style={{
        marginLeft: 14, flex: 1, maxWidth: 340,
        display: 'flex', alignItems: 'center', gap: 9,
        height: 36, padding: '0 12px',
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 10, color: 'var(--faint)',
      }}>
        <Search size={14} strokeWidth={1.6} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 13, whiteSpace: 'nowrap' }}>Search bikes, customers, bookings…</span>
        <span style={{
          marginLeft: 'auto',
          fontFamily: "'Geist Mono', monospace", fontSize: 10.5,
          border: '1px solid var(--border)',
          padding: '1px 5px', borderRadius: 5, flexShrink: 0,
        }}>⌘K</span>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Theme toggle */}
        <button onClick={toggleTheme} style={iconBtn}>
          {theme === 'light'
            ? <Sun size={16} strokeWidth={1.6} />
            : <Moon size={16} strokeWidth={1.6} />
          }
        </button>

        {/* Notifications */}
        <button style={{ ...iconBtn, position: 'relative' }}>
          <Bell size={16} strokeWidth={1.6} />
          <span style={{
            position: 'absolute', top: 7, right: 8,
            width: 6, height: 6, borderRadius: 999,
            background: 'var(--brand)',
            border: '1.5px solid var(--surface)',
          }} />
        </button>

        <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 4px' }} />

        {/* User button */}
        <button style={{
          display: 'flex', alignItems: 'center', gap: 8,
          height: 36, padding: '0 8px 0 6px',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          borderRadius: 10, cursor: 'pointer', color: 'var(--ink)',
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: 7,
            background: 'var(--brand)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Geist Mono', monospace", fontSize: 11, flexShrink: 0,
          }}>{initials}</div>
          <span style={{ fontSize: 12.5, fontWeight: 500 }}>
            {user?.name?.split(' ')[0] || 'Admin'}
          </span>
          <ChevronDown size={12} style={{ color: 'var(--faint)' }} />
        </button>
      </div>
    </header>
  );
}
