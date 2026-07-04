import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, X, LayoutDashboard, Bike, CalendarCheck,
  Users, Wrench, CreditCard, Settings,
} from 'lucide-react';
import { MOTOS_MOCK } from '@/mocks/motos';
import { CUSTOMERS_MOCK, RESERVATIONS_MOCK } from '@/mocks/reservations';

type ItemType = 'page' | 'moto' | 'customer' | 'reservation';

type ResultItem = {
  id: string;
  type: ItemType;
  label: string;
  sub?: string;
  path: string;
  icon: React.ReactNode;
};

const PAGES: ResultItem[] = [
  { id: 'p-dash',  type: 'page', label: 'Dashboard',    path: '/',            icon: <LayoutDashboard size={13} strokeWidth={1.6} /> },
  { id: 'p-fleet', type: 'page', label: 'Fleet',         path: '/motos',       icon: <Bike            size={13} strokeWidth={1.6} /> },
  { id: 'p-res',   type: 'page', label: 'Reservations',  path: '/reservations',icon: <CalendarCheck   size={13} strokeWidth={1.6} /> },
  { id: 'p-cus',   type: 'page', label: 'Customers',     path: '/customers',   icon: <Users           size={13} strokeWidth={1.6} /> },
  { id: 'p-pay',   type: 'page', label: 'Payments',      path: '/payments',    icon: <CreditCard      size={13} strokeWidth={1.6} /> },
  { id: 'p-maint', type: 'page', label: 'Maintenance',   path: '/maintenance', icon: <Wrench          size={13} strokeWidth={1.6} /> },
  { id: 'p-sett',  type: 'page', label: 'Settings',      path: '/settings',    icon: <Settings        size={13} strokeWidth={1.6} /> },
];

const SECTION_LABELS: Record<ItemType, string> = {
  page:        'Navigation',
  moto:        'Motorcycles',
  customer:    'Customers',
  reservation: 'Reservations',
};

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const items = useMemo<ResultItem[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PAGES;

    const results: ResultItem[] = [];

    PAGES.filter(p => p.label.toLowerCase().includes(q)).forEach(p => results.push(p));

    MOTOS_MOCK
      .filter(m =>
        m.brand.toLowerCase().includes(q) ||
        m.model.toLowerCase().includes(q) ||
        m.plate.toLowerCase().includes(q)
      )
      .forEach(m => results.push({
        id:    `moto-${m.id}`,
        type:  'moto',
        label: `${m.brand} ${m.model}`,
        sub:   m.plate,
        path:  '/motos',
        icon:  <Bike size={13} strokeWidth={1.6} />,
      }));

    CUSTOMERS_MOCK
      .filter(c =>
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      )
      .forEach(c => results.push({
        id:    `cus-${c.id}`,
        type:  'customer',
        label: `${c.firstName} ${c.lastName}`,
        sub:   c.email,
        path:  '/customers',
        icon:  <Users size={13} strokeWidth={1.6} />,
      }));

    RESERVATIONS_MOCK
      .filter(r =>
        r.id.toLowerCase().includes(q) ||
        r.motoId.toLowerCase().includes(q)
      )
      .forEach(r => results.push({
        id:    `res-${r.id}`,
        type:  'reservation',
        label: `Reservation #${r.id.toUpperCase().slice(0, 6)}`,
        sub:   `€${r.totalAmount}`,
        path:  '/reservations',
        icon:  <CalendarCheck size={13} strokeWidth={1.6} />,
      }));

    return results;
  }, [query]);

  useEffect(() => { setCursor(0); }, [query]);

  const select = (item: ResultItem) => {
    navigate(item.path);
    onClose();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, items.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
    if (e.key === 'Enter' && items[cursor]) select(items[cursor]);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '13vh',
        background: 'rgba(0,0,0,.4)',
        backdropFilter: 'blur(2px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 520, maxWidth: '95vw',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16, boxShadow: 'var(--shadow)',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKey}
      >
        {/* Input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '13px 16px',
          borderBottom: '1px solid var(--border-2)',
        }}>
          <Search size={15} strokeWidth={1.6} style={{ color: 'var(--faint)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search bikes, customers, bookings…"
            style={{
              flex: 1, fontSize: 14, background: 'transparent',
              border: 'none', outline: 'none', color: 'var(--ink)',
            }}
          />
          {query ? (
            <button onClick={() => setQuery('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--faint)', display: 'flex', padding: 0 }}>
              <X size={14} />
            </button>
          ) : (
            <kbd style={{
              fontFamily: "'Geist Mono', monospace", fontSize: 10,
              border: '1px solid var(--border)', padding: '2px 6px',
              borderRadius: 5, color: 'var(--faint)', flexShrink: 0,
            }}>ESC</kbd>
          )}
        </div>

        {/* Results */}
        <div style={{ maxHeight: 368, overflowY: 'auto', padding: '6px' }}>
          {items.length === 0 ? (
            <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--faint)', fontSize: 13 }}>
              No results for "<strong style={{ color: 'var(--ink)' }}>{query}</strong>"
            </div>
          ) : (
            items.map((item, i) => {
              const prevType = i > 0 ? items[i - 1].type : null;
              const showHeader = item.type !== prevType;
              return (
                <div key={item.id}>
                  {showHeader && (
                    <div style={{
                      fontSize: 10.5,
                      fontFamily: "'Geist Mono',monospace",
                      letterSpacing: '.08em', textTransform: 'uppercase',
                      color: 'var(--faint)',
                      padding: `${i === 0 ? '6' : '10'}px 10px 4px`,
                    }}>
                      {SECTION_LABELS[item.type]}
                    </div>
                  )}
                  <button
                    onClick={() => select(item)}
                    onMouseEnter={() => setCursor(i)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      width: '100%', padding: '8px 10px',
                      border: 'none', borderRadius: 9,
                      background: cursor === i ? 'var(--surface-2)' : 'transparent',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <span style={{ color: 'var(--faint)', flexShrink: 0, display: 'flex' }}>
                      {item.icon}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{item.label}</span>
                    {item.sub && (
                      <span style={{ fontSize: 11.5, color: 'var(--faint)', marginLeft: 2 }}>{item.sub}</span>
                    )}
                    {cursor === i && (
                      <span style={{
                        marginLeft: 'auto', fontSize: 9.5,
                        fontFamily: "'Geist Mono',monospace",
                        color: 'var(--faint)', opacity: 0.7,
                        border: '1px solid var(--border)', padding: '1px 5px', borderRadius: 4,
                      }}>
                        ⏎
                      </span>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '8px 16px', borderTop: '1px solid var(--border-2)',
          display: 'flex', gap: 16,
          fontSize: 11, color: 'var(--faint)',
          fontFamily: "'Geist Mono',monospace",
        }}>
          <span>↑↓ navigate</span>
          <span>⏎ open</span>
          <span>ESC close</span>
        </div>
      </div>
    </div>
  );
}
