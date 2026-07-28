import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PanelLeft, Sun, Moon, Bell, ChevronDown, ChevronRight, LogOut, Settings, Bike, CalendarCheck, Wrench, X } from 'lucide-react';
import { useLayout } from '@/core/hooks/useLayout';
import { useAuth } from '@/core/auth/AuthContext';
import { CommandPalette } from '@/core/components/ui/CommandPalette';

const breadcrumbs: Record<string, string> = {
  '/': 'Dashboard',
  '/motos': 'Fleet',
  '/reservations': 'Reservations',
  '/customers': 'Customers',
  '/payments': 'Payments',
  '/maintenance': 'Maintenance',
  '/settings': 'Settings',
};

type Notif = {
  id: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

const MOCK_NOTIFS: Notif[] = [
  {
    id: 'n1',
    icon: <CalendarCheck size={14} strokeWidth={1.6} />,
    title: 'New reservation pending',
    body: 'Jean Dupont — Kawasaki Z900, 2 days',
    time: 'Just now',
    unread: true,
  },
  {
    id: 'n2',
    icon: <Wrench size={14} strokeWidth={1.6} />,
    title: 'Maintenance overdue',
    body: 'BMW R 1250 GS (IJ-789-KL) — service due Jul 10',
    time: '2h ago',
    unread: true,
  },
  {
    id: 'n3',
    icon: <Bike size={14} strokeWidth={1.6} />,
    title: 'Return expected tomorrow',
    body: 'Honda CB500F — Marie Martin',
    time: 'Today',
    unread: false,
  },
];

export function Header() {
  const { theme, toggleTheme, toggleCollapsed } = useLayout();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const crumb = breadcrumbs[location.pathname] ?? 'Dashboard';
  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AM';

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>(MOCK_NOTIFS);
  const notifRef = useRef<HTMLDivElement>(null);

  const [paletteOpen, setPaletteOpen] = useState(false);

  const unreadCount = notifs.filter(n => n.unread).length;

  /* close user menu on outside click */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* close notif panel on outside click */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ⌘K global shortcut */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(o => !o);
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    navigate('/login');
  };

  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, unread: false })));
  const toggleRead = (id: string) =>
    setNotifs(prev => prev.map(x => x.id === id ? { ...x, unread: !x.unread } : x));

  const iconBtn: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 34, height: 34,
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    borderRadius: 9, color: 'var(--muted)',
    cursor: 'pointer', flexShrink: 0,
  };

  return (
    <>
      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}

      <header style={{
        height: 60, flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '0 22px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        position: 'relative', zIndex: 40,
      }}>
        <button onClick={toggleCollapsed} style={iconBtn} aria-label="Toggle sidebar">
          <PanelLeft size={16} strokeWidth={1.6} />
        </button>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--faint)' }}>
          <span>Yard</span>
          <ChevronRight size={12} style={{ color: 'var(--border-2)' }} />
          <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{crumb}</span>
        </div>

        {/* Search → opens CommandPalette */}
        <button
          onClick={() => setPaletteOpen(true)}
          aria-label="Open command palette"
          style={{
            marginLeft: 14, flex: 1, maxWidth: 340,
            display: 'flex', alignItems: 'center', gap: 9,
            height: 36, padding: '0 12px',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 10, color: 'var(--faint)',
            cursor: 'text',
          }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <span style={{ fontSize: 13, whiteSpace: 'nowrap' }}>Search bikes, customers, bookings…</span>
          <span style={{
            marginLeft: 'auto',
            fontFamily: "'Geist Mono', monospace", fontSize: 10.5,
            border: '1px solid var(--border)',
            padding: '1px 5px', borderRadius: 5, flexShrink: 0,
          }}>⌘K</span>
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Theme toggle */}
          <button onClick={toggleTheme} style={iconBtn} aria-label="Toggle theme">
            {theme === 'light'
              ? <Sun size={16} strokeWidth={1.6} />
              : <Moon size={16} strokeWidth={1.6} />
            }
          </button>

          {/* Notifications */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setNotifOpen(o => !o)}
              style={{ ...iconBtn, position: 'relative' }}
              aria-label="Notifications"
              aria-haspopup="true"
              aria-expanded={notifOpen}
            >
              <Bell size={16} strokeWidth={1.6} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: 7, right: 8,
                  width: 6, height: 6, borderRadius: 999,
                  background: 'var(--brand)',
                  border: '1.5px solid var(--surface)',
                }} />
              )}
            </button>

            {notifOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 14, boxShadow: 'var(--shadow)',
                width: 320, zIndex: 100,
                overflow: 'hidden',
              }}>
                {/* Panel header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px 10px',
                  borderBottom: '1px solid var(--border-2)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Notifications</span>
                    {unreadCount > 0 && (
                      <span style={{
                        background: 'var(--brand)', color: '#fff',
                        borderRadius: 999, padding: '1px 6px',
                        fontSize: 9.5, fontFamily: "'Geist Mono',monospace",
                      }}>{unreadCount}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} style={{
                        fontSize: 11.5, color: 'var(--brand)',
                        border: 'none', background: 'transparent', cursor: 'pointer', padding: 0,
                      }}>Mark all read</button>
                    )}
                    <button onClick={() => setNotifOpen(false)} style={{
                      border: 'none', background: 'transparent', cursor: 'pointer',
                      color: 'var(--faint)', display: 'flex', padding: 0,
                    }}>
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* Notif list */}
                <div>
                  {notifs.map(n => (
                    <div key={n.id} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--border-2)',
                      background: n.unread ? 'color-mix(in srgb,var(--brand) 5%,transparent)' : 'transparent',
                    }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                        background: 'var(--surface-2)', border: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--muted)',
                      }}>
                        {n.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 12.5, fontWeight: n.unread ? 600 : 500,
                          color: 'var(--ink)', lineHeight: 1.3,
                        }}>
                          {n.title}
                          {n.unread && (
                            <span style={{
                              display: 'inline-block', width: 6, height: 6,
                              borderRadius: 999, background: 'var(--brand)',
                              marginLeft: 6, verticalAlign: 'middle',
                            }} />
                          )}
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--faint)', marginTop: 2 }}>{n.body}</div>
                        <div style={{
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'space-between', marginTop: 4, gap: 8,
                        }}>
                          <span style={{
                            fontSize: 10.5, color: 'var(--faint)',
                            fontFamily: "'Geist Mono',monospace",
                          }}>{n.time}</span>
                          <button
                            onClick={() => toggleRead(n.id)}
                            style={{
                              fontSize: 10.5, color: 'var(--brand)',
                              border: 'none', background: 'transparent',
                              cursor: 'pointer', padding: 0, flexShrink: 0,
                              textDecoration: 'underline',
                              textUnderlineOffset: '2px',
                            }}
                          >
                            {n.unread ? 'Mark read' : 'Mark unread'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div style={{ padding: '10px 16px', textAlign: 'center' }}>
                  <button
                    onClick={() => { setNotifOpen(false); navigate('/maintenance'); }}
                    style={{
                      fontSize: 12, color: 'var(--brand)',
                      border: 'none', background: 'transparent', cursor: 'pointer',
                    }}
                  >
                    View all alerts →
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 4px' }} />

          {/* User menu */}
          <div ref={userMenuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setUserMenuOpen(o => !o)}
              aria-haspopup="true"
              aria-expanded={userMenuOpen}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                height: 36, padding: '0 8px 0 6px',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                borderRadius: 10, cursor: 'pointer', color: 'var(--ink)',
              }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: 7,
                background: 'var(--brand)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Geist Mono', monospace", fontSize: 11, flexShrink: 0,
              }}>{initials}</div>
              <span style={{ fontSize: 12.5, fontWeight: 500 }}>
                {user?.name?.split(' ')[0] || 'Admin'}
              </span>
              <ChevronDown size={12} style={{
                color: 'var(--faint)',
                transform: userMenuOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform .15s',
              }} />
            </button>

            {userMenuOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12, boxShadow: 'var(--shadow)',
                minWidth: 190, padding: '6px',
                zIndex: 100,
              }}>
                <div style={{ padding: '10px 12px 8px', borderBottom: '1px solid var(--border-2)', marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{user?.name || 'Admin'}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--faint)', marginTop: 1 }}>{user?.email}</div>
                </div>
                {[
                  { icon: Settings, label: 'Settings', onClick: () => { setUserMenuOpen(false); navigate('/settings'); } },
                ].map(({ icon: Icon, label, onClick }) => (
                  <button key={label} onClick={onClick} style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    width: '100%', padding: '8px 10px',
                    border: 'none', background: 'transparent',
                    borderRadius: 8, fontSize: 13, color: 'var(--ink)',
                    cursor: 'pointer', textAlign: 'left',
                  }}>
                    <Icon size={14} strokeWidth={1.6} style={{ color: 'var(--muted)' }} />
                    {label}
                  </button>
                ))}
                <div style={{ borderTop: '1px solid var(--border-2)', marginTop: 4, paddingTop: 4 }}>
                  <button onClick={handleLogout} style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    width: '100%', padding: '8px 10px',
                    border: 'none', background: 'transparent',
                    borderRadius: 8, fontSize: 13, color: 'var(--cmy-red)',
                    cursor: 'pointer', textAlign: 'left',
                  }}>
                    <LogOut size={14} strokeWidth={1.6} />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
