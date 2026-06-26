import { useState } from 'react';
import { Bike, Plus, SlidersHorizontal, ArrowUpDown, Search, Ellipsis } from 'lucide-react';
import { MOTOS_MOCK } from '@/mocks/motos';
import type { MotoStatus } from '../types';

const tabs: { key: MotoStatus | 'all'; label: string; count: number }[] = [
  { key: 'all',         label: 'All',         count: 163 },
  { key: 'available',   label: 'Available',   count: 93  },
  { key: 'reserved',    label: 'On rent',     count: 44  },
  { key: 'maintenance', label: 'Maintenance', count: 15  },
  { key: 'inactive',    label: 'Reserved',    count: 11  },
];

const statusCfg: Record<MotoStatus, { label: string; color: string; bg: string }> = {
  available:   { label: 'Available',   color: 'var(--cmy-green)', bg: 'color-mix(in srgb,var(--cmy-green) 13%,transparent)' },
  reserved:    { label: 'On rent',     color: 'var(--brand)',     bg: 'var(--brand-tint)' },
  maintenance: { label: 'Maintenance', color: 'var(--cmy-amber)', bg: 'color-mix(in srgb,var(--cmy-amber) 15%,transparent)' },
  inactive:    { label: 'Inactive',    color: 'var(--faint)',     bg: 'color-mix(in srgb,var(--faint) 16%,transparent)' },
};

function StatusPill({ status }: { status: MotoStatus }) {
  const c = statusCfg[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontFamily: "'Geist Mono',monospace", fontSize: 9.5,
      textTransform: 'uppercase', letterSpacing: '.04em',
      padding: '3px 7px', borderRadius: 999,
      color: c.color, background: c.bg,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: 999, background: c.color }} />
      {c.label}
    </span>
  );
}

export function MotoListPage() {
  const [tab, setTab] = useState<MotoStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = MOTOS_MOCK.filter(m => {
    const matchTab = tab === 'all' || m.status === tab;
    const matchSearch = !search ||
      m.brand.toLowerCase().includes(search.toLowerCase()) ||
      m.model.toLowerCase().includes(search.toLowerCase()) ||
      m.plate.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const card: React.CSSProperties = {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 16, boxShadow: 'var(--shadow)', overflow: 'hidden',
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "'Cormorant Garamond',serif", fontSize: 30, fontWeight: 600, letterSpacing: '.01em', lineHeight: 1.05, color: 'var(--ink)' }}>Fleet</h1>
          <p style={{ margin: '5px 0 0', fontSize: 13.5, color: 'var(--muted)' }}>
            163 motorcycles ·{' '}
            <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 12 }}>137 in rotation</span> ·{' '}
            <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 12, color: 'var(--cmy-amber)' }}>15 in service</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 7, height: 36, padding: '0 13px',
            border: '1px solid var(--border)', background: 'var(--surface)',
            borderRadius: 10, fontSize: 13, fontWeight: 500, color: 'var(--ink)', cursor: 'pointer',
          }}>
            <SlidersHorizontal size={15} strokeWidth={1.6} />Filters
          </button>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 7, height: 36, padding: '0 14px',
            background: 'var(--brand)', color: '#fff',
            border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>
            <Plus size={15} strokeWidth={1.6} />Add motorcycle
          </button>
        </div>
      </div>

      {/* Tabs + search row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <div style={{
          display: 'flex', gap: 3,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 10, padding: 4,
        }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              fontSize: 12.5, fontWeight: 500, padding: '6px 11px', borderRadius: 7,
              border: 'none', cursor: 'pointer',
              background: tab === t.key ? 'var(--ink)' : 'transparent',
              color: tab === t.key ? 'var(--bg)' : 'var(--muted)',
            }}>
              {t.label}{' '}
              <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 10, opacity: 0.65 }}>{t.count}</span>
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 12px',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 10, color: 'var(--faint)', minWidth: 210,
          }}>
            <Search size={14} strokeWidth={1.6} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search fleet…"
              style={{ fontSize: 13, background: 'transparent', border: 'none', outline: 'none', color: 'var(--ink)', width: '100%' }}
            />
          </div>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 12px',
            border: '1px solid var(--border)', background: 'var(--surface)',
            borderRadius: 10, fontSize: 12.5, color: 'var(--ink)', cursor: 'pointer',
          }}>
            <ArrowUpDown size={14} strokeWidth={1.6} />Sort
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={card}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '34px 2.4fr 1fr 1.15fr 1fr 1fr .9fr .7fr 36px',
          gap: 12, alignItems: 'center', padding: '11px 18px',
          fontFamily: "'Geist Mono',monospace", fontSize: 10,
          letterSpacing: '.08em', textTransform: 'uppercase',
          color: 'var(--faint)', background: 'var(--surface-2)',
          borderBottom: '1px solid var(--border-2)',
        }}>
          <input type="checkbox" style={{ width: 15, height: 15, accentColor: 'var(--brand)', cursor: 'pointer' }} />
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--ink)', cursor: 'pointer' }}>
            Motorcycle
          </span>
          <span>Category</span>
          <span>Status</span>
          <span>Mileage</span>
          <span>Next service</span>
          <span>Location</span>
          <span>Rate</span>
          <span />
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--faint)', fontSize: 13 }}>
            No motorcycles found.
          </div>
        ) : (
          filtered.map((moto) => (
            <div key={moto.id} style={{
              display: 'grid',
              gridTemplateColumns: '34px 2.4fr 1fr 1.15fr 1fr 1fr .9fr .7fr 36px',
              gap: 12, alignItems: 'center', padding: '11px 18px',
              borderTop: '1px solid var(--border-2)', fontSize: 12.5,
            }}>
              <input type="checkbox" style={{ width: 15, height: 15, accentColor: 'var(--brand)', cursor: 'pointer' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--brand)', flexShrink: 0,
                }}>
                  <Bike size={15} strokeWidth={1.6} />
                </div>
                <div>
                  <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{moto.brand} {moto.model}</div>
                  <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: 10.5, color: 'var(--faint)' }}>{moto.plate}</div>
                </div>
              </div>
              <span style={{ color: 'var(--muted)' }}>{moto.category}</span>
              <StatusPill status={moto.status} />
              <span style={{ fontFamily: "'Geist Mono',monospace", color: 'var(--ink)' }}>
                {moto.mileage.toLocaleString('fr-FR')} km
              </span>
              <span style={{ fontFamily: "'Geist Mono',monospace", color: 'var(--cmy-amber)', fontSize: 12 }}>—</span>
              <span style={{ fontFamily: "'Geist Mono',monospace", color: 'var(--faint)', fontSize: 12 }}>—</span>
              <span style={{ fontFamily: "'Geist Mono',monospace", color: 'var(--ink)' }}>€{moto.pricePerDay}</span>
              <button style={{
                width: 28, height: 28, border: 'none', background: 'transparent',
                borderRadius: 7, color: 'var(--faint)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Ellipsis size={15} strokeWidth={1.6} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
