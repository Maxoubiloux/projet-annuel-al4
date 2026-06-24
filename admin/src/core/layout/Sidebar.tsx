import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Bike, CalendarCheck, Users,
  Wrench, CreditCard, Settings, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useLayout } from '@/core/hooks/useLayout';
import { useAuth } from '@/core/auth/AuthContext';

const overviewNav = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Fleet', href: '/motos', icon: Bike, meta: '163' },
  { name: 'Reservations', href: '/reservations', icon: CalendarCheck, badge: '12' },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Maintenance', href: '/maintenance', icon: Wrench, badgeAmber: '7' },
];

const systemNav = [
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const { collapsed, toggleCollapsed } = useLayout();
  const { user } = useAuth();
  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AM';

  return (
    <aside
      style={{
        width: collapsed ? 72 : 250,
        transition: 'width .26s cubic-bezier(.4,0,.2,1)',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{
        height: 60, display: 'flex', alignItems: 'center',
        gap: 10, padding: '0 18px',
        borderBottom: '1px solid var(--border-2)', flexShrink: 0,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'var(--brand)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 19,
          flexShrink: 0,
        }}>C</div>
        {!collapsed && (
          <div style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: 21, fontWeight: 600,
            letterSpacing: '.01em', whiteSpace: 'nowrap', lineHeight: 1,
            color: 'var(--ink)',
          }}>
            City Moto Yard<span style={{ color: 'var(--brand)' }}>.</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{
        flex: 1, overflowY: 'auto', padding: '14px 12px',
        display: 'flex', flexDirection: 'column', gap: 3,
      }}>
        {!collapsed && (
          <div style={{
            fontFamily: "'Geist Mono', monospace", fontSize: 10,
            letterSpacing: '.14em', textTransform: 'uppercase',
            color: 'var(--faint)', padding: '6px 10px',
          }}>Overview</div>
        )}

        {overviewNav.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/'}
              title={collapsed ? item.name : undefined}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: collapsed ? 0 : 11,
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: '9px 11px',
                borderRadius: 9,
                textDecoration: 'none',
                color: isActive ? 'var(--brand)' : 'var(--muted)',
                fontSize: 13.5,
                fontWeight: 500,
                position: 'relative',
                background: isActive ? 'var(--brand-tint)' : 'transparent',
              })}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span style={{
                      position: 'absolute', left: -12, top: '50%',
                      transform: 'translateY(-50%)',
                      width: 3, height: 18, borderRadius: 3,
                      background: 'var(--brand)',
                    }} />
                  )}
                  <Icon size={18} strokeWidth={1.6} style={{ flexShrink: 0 }} />
                  {!collapsed && (
                    <>
                      <span style={{ whiteSpace: 'nowrap', flex: 1 }}>{item.name}</span>
                      {'badge' in item && item.badge && (
                        <span style={{
                          background: 'var(--brand)', color: '#fff',
                          fontFamily: "'Geist Mono', monospace", fontSize: 10,
                          padding: '1px 6px', borderRadius: 999,
                        }}>{item.badge}</span>
                      )}
                      {'badgeAmber' in item && item.badgeAmber && (
                        <span style={{
                          background: 'color-mix(in srgb, var(--cmy-amber) 18%, transparent)',
                          color: 'var(--cmy-amber)',
                          fontFamily: "'Geist Mono', monospace", fontSize: 10,
                          padding: '1px 6px', borderRadius: 999,
                        }}>{item.badgeAmber}</span>
                      )}
                      {'meta' in item && item.meta && !('badge' in item) && (
                        <span style={{
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: 10.5, color: 'var(--faint)',
                        }}>{item.meta}</span>
                      )}
                    </>
                  )}
                </>
              )}
            </NavLink>
          );
        })}

        {!collapsed ? (
          <div style={{
            fontFamily: "'Geist Mono', monospace", fontSize: 10,
            letterSpacing: '.14em', textTransform: 'uppercase',
            color: 'var(--faint)', padding: '16px 10px 6px',
          }}>System</div>
        ) : (
          <div style={{ height: 16 }} />
        )}

        {systemNav.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              title={collapsed ? item.name : undefined}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: collapsed ? 0 : 11,
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: '9px 11px',
                borderRadius: 9,
                textDecoration: 'none',
                color: isActive ? 'var(--brand)' : 'var(--muted)',
                fontSize: 13.5,
                fontWeight: 500,
                position: 'relative',
                background: isActive ? 'var(--brand-tint)' : 'transparent',
              })}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span style={{
                      position: 'absolute', left: -12, top: '50%',
                      transform: 'translateY(-50%)',
                      width: 3, height: 18, borderRadius: 3,
                      background: 'var(--brand)',
                    }} />
                  )}
                  <Icon size={18} strokeWidth={1.6} style={{ flexShrink: 0 }} />
                  {!collapsed && (
                    <span style={{ whiteSpace: 'nowrap' }}>{item.name}</span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer: user + collapse toggle */}
      <div style={{ padding: 12, borderTop: '1px solid var(--border-2)' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: collapsed ? 0 : 10,
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: '8px 9px', borderRadius: 10,
          background: 'var(--surface-2)',
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'var(--brand)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Geist Mono', monospace", fontSize: 12, fontWeight: 500,
            flexShrink: 0,
          }}>{initials}</div>
          {!collapsed && (
            <div style={{ lineHeight: 1.25, overflow: 'hidden' }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', color: 'var(--ink)' }}>
                {user?.name || 'Fleet Manager'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--faint)', whiteSpace: 'nowrap' }}>
                {user?.role || 'admin'}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={toggleCollapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            marginTop: 8, width: '100%', height: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--border)', borderRadius: 8,
            background: 'transparent', color: 'var(--faint)',
            cursor: 'pointer',
          }}
        >
          {collapsed
            ? <ChevronRight size={13} strokeWidth={1.6} />
            : <ChevronLeft size={13} strokeWidth={1.6} />
          }
        </button>
      </div>
    </aside>
  );
}
