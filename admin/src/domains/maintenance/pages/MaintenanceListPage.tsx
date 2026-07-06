import { useState } from 'react';
import { Plus, Wrench, X, SlidersHorizontal, Search, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

const MAINTENANCE = [
  { id: 'm1', moto: 'Kawasaki Z900',         plate: 'CMY-072', type: 'Brake service overdue',  date: '2026-06-23', km: '18,400', cost: 280, sev: 'critical', status: 'open'       },
  { id: 'm2', moto: 'Ducati Monster 937',    plate: 'CMY-038', type: 'Oil change',              date: '2026-06-28', km: '12,050', cost: 95,  sev: 'warning',  status: 'open'       },
  { id: 'm3', moto: 'BMW R nineT',           plate: 'CMY-119', type: 'Tire wear inspection',    date: '2026-06-30', km: '9,800',  cost: 60,  sev: 'warning',  status: 'open'       },
  { id: 'm4', moto: 'Triumph Street Triple', plate: 'CMY-051', type: 'Chain lubrication',       date: '2026-07-04', km: '15,600', cost: 40,  sev: 'ok',       status: 'scheduled'  },
  { id: 'm5', moto: 'Honda CB650R',          plate: 'CMY-088', type: 'Annual inspection',       date: '2026-07-08', km: '7,200',  cost: 200, sev: 'ok',       status: 'scheduled'  },
  { id: 'm6', moto: 'Yamaha MT-07',          plate: 'CMY-014', type: 'Brake pad replacement',   date: '2026-06-15', km: '22,100', cost: 120, sev: 'ok',       status: 'completed'  },
  { id: 'm7', moto: 'Vespa GTS 300',         plate: 'CMY-033', type: 'Spark plug change',       date: '2026-06-10', km: '11,400', cost: 55,  sev: 'ok',       status: 'completed'  },
];

type Sev = 'critical' | 'warning' | 'ok';
type Stat = 'open' | 'scheduled' | 'completed';
type MaintenanceItem = typeof MAINTENANCE[number];
type SortField = 'moto' | 'date' | 'cost' | 'status' | 'sev';
type SortDir = 'asc' | 'desc';

const SEV_ORDER: Record<Sev, number>  = { critical: 0, warning: 1, ok: 2 };
const STAT_ORDER: Record<Stat, number> = { open: 0, scheduled: 1, completed: 2 };

const sevColor: Record<Sev, string> = {
  critical: 'var(--cmy-red)',
  warning:  'var(--cmy-amber)',
  ok:       'var(--cmy-green)',
};

const statCfg: Record<Stat, { label: string; color: string; bg: string }> = {
  open:      { label: 'Open',      color: 'var(--cmy-red)',   bg: 'color-mix(in srgb,var(--cmy-red) 14%,transparent)'   },
  scheduled: { label: 'Scheduled', color: 'var(--cmy-amber)', bg: 'color-mix(in srgb,var(--cmy-amber) 15%,transparent)' },
  completed: { label: 'Done',      color: 'var(--cmy-green)', bg: 'color-mix(in srgb,var(--cmy-green) 13%,transparent)' },
};

function Pill({ stat }: { stat: Stat }) {
  const c = statCfg[stat];
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

/* ── Detail modal ── */
function DetailModal({ item, onClose }: { item: MaintenanceItem; onClose: () => void }) {
  const sev = item.sev as Sev;
  const stat = item.status as Stat;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,.45)',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 18, boxShadow: 'var(--shadow)',
        width: 440, maxWidth: '95vw', padding: '28px 28px 24px',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 10, height: 10, borderRadius: 999, background: sevColor[sev], flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 600, color: 'var(--ink)' }}>
                {item.type}
              </div>
              <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 2 }}>{item.moto} · {item.plate}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--faint)', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <InfoRow label="Due date" value={item.date} />
          <InfoRow label="Mileage" value={`${item.km} km`} />
          <InfoRow label="Estimated cost" value={`€${item.cost}`} />
          <div>
            <div style={{ fontSize: 11, color: 'var(--faint)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: "'Geist Mono',monospace" }}>Status</div>
            <Pill stat={stat} />
          </div>
          {/* TODO: notes field — connect to PATCH /api/maintenance/:id */}
          <div>
            <div style={{ fontSize: 11, color: 'var(--faint)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: "'Geist Mono',monospace" }}>Notes</div>
            <textarea
              placeholder="Add notes about this job…"
              style={{
                width: '100%', minHeight: 70, padding: '8px 10px',
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: 8, fontSize: 13, color: 'var(--ink)',
                resize: 'vertical', outline: 'none',
                fontFamily: "'Geist',system-ui,sans-serif",
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* TODO: actions connect to PATCH /api/maintenance/:id */}
        <div style={{ display: 'flex', gap: 8, marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--border-2)' }}>
          <button onClick={onClose} style={{
            flex: 1, height: 36, border: '1px solid var(--border)',
            background: 'var(--surface-2)', borderRadius: 9,
            fontSize: 13, color: 'var(--ink)', cursor: 'pointer',
          }}>Close</button>
          <button onClick={onClose} style={{
            flex: 1, height: 36, border: 'none',
            background: 'var(--brand)', color: '#fff', borderRadius: 9,
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>Mark as done</button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--faint)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: "'Geist Mono',monospace" }}>{label}</div>
      <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{value}</div>
    </div>
  );
}

const STATUS_TABS: { key: Stat | 'all'; label: string }[] = [
  { key: 'all',       label: 'All'       },
  { key: 'open',      label: 'Open'      },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'completed', label: 'Done'      },
];

const SEV_FILTERS: { key: Sev | 'all'; label: string; color?: string }[] = [
  { key: 'all',      label: 'All'      },
  { key: 'critical', label: 'Critical', color: 'var(--cmy-red)'   },
  { key: 'warning',  label: 'Warning',  color: 'var(--cmy-amber)' },
  { key: 'ok',       label: 'OK',       color: 'var(--cmy-green)' },
];

export function MaintenanceListPage() {
  const [statTab, setStatTab] = useState<Stat | 'all'>('all');
  const [sevFilter, setSevFilter] = useState<Sev | 'all'>('all');
  const [detailItem, setDetailItem] = useState<MaintenanceItem | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{ field: SortField; dir: SortDir }>({ field: 'date', dir: 'asc' });

  const statCounts = STATUS_TABS.reduce((acc, t) => {
    acc[t.key] = t.key === 'all'
      ? MAINTENANCE.length
      : MAINTENANCE.filter(m => m.status === t.key).length;
    return acc;
  }, {} as Record<string, number>);

  const filtered = MAINTENANCE.filter(m => {
    const matchStat = statTab === 'all' || m.status === statTab;
    const matchSev = sevFilter === 'all' || m.sev === sevFilter;
    const matchSearch = !search ||
      m.moto.toLowerCase().includes(search.toLowerCase()) ||
      m.plate.toLowerCase().includes(search.toLowerCase()) ||
      m.type.toLowerCase().includes(search.toLowerCase());
    return matchStat && matchSev && matchSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    const d = sort.dir === 'asc' ? 1 : -1;
    if (sort.field === 'moto')   return d * a.moto.localeCompare(b.moto);
    if (sort.field === 'date')   return d * a.date.localeCompare(b.date);
    if (sort.field === 'cost')   return d * (a.cost - b.cost);
    if (sort.field === 'status') return d * (STAT_ORDER[a.status as Stat] - STAT_ORDER[b.status as Stat]);
    if (sort.field === 'sev')    return d * (SEV_ORDER[a.sev as Sev] - SEV_ORDER[b.sev as Sev]);
    return 0;
  });

  const open = MAINTENANCE.filter(m => m.status === 'open').length;
  const activeFilterCount = sevFilter !== 'all' ? 1 : 0;

  const toggleSort = (field: SortField) => {
    setSort(s => s.field === field
      ? { field, dir: s.dir === 'asc' ? 'desc' : 'asc' }
      : { field, dir: 'asc' });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sort.field !== field) return <ArrowUpDown size={11} style={{ opacity: 0.4 }} />;
    return sort.dir === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />;
  };

  const colBtn: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: "'Geist Mono',monospace", fontSize: 10,
    letterSpacing: '.08em', textTransform: 'uppercase',
    color: 'var(--faint)', padding: 0,
  };

  const card: React.CSSProperties = {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 16, boxShadow: 'var(--shadow)',
  };

  const chipBtn = (active: boolean, color?: string): React.CSSProperties => ({
    padding: '4px 10px', borderRadius: 7, fontSize: 12,
    border: '1px solid var(--border)',
    background: active ? (color || 'var(--ink)') : 'transparent',
    color: active ? 'var(--bg)' : 'var(--muted)',
    cursor: 'pointer',
  });

  return (
    <div>
      {detailItem && <DetailModal item={detailItem} onClose={() => setDetailItem(null)} />}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "'Cormorant Garamond',serif", fontSize: 30, fontWeight: 600, letterSpacing: '.01em', lineHeight: 1.05, color: 'var(--ink)' }}>Maintenance</h1>
          <p style={{ margin: '5px 0 0', fontSize: 13.5, color: 'var(--muted)' }}>
            {MAINTENANCE.length} records ·{' '}
            <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 12, color: 'var(--cmy-red)' }}>{open} open</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setFiltersOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7, height: 36, padding: '0 13px',
              border: '1px solid var(--border)',
              background: filtersOpen ? 'var(--surface-2)' : 'var(--surface)',
              borderRadius: 10, fontSize: 13, fontWeight: 500, color: 'var(--ink)', cursor: 'pointer',
            }}
          >
            <SlidersHorizontal size={15} strokeWidth={1.6} />Filters
            {activeFilterCount > 0 && (
              <span style={{
                background: 'var(--brand)', color: '#fff',
                borderRadius: 999, width: 16, height: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontFamily: "'Geist Mono',monospace",
              }}>{activeFilterCount}</span>
            )}
          </button>
          {/* TODO: open CreateMaintenanceJobModal + POST /api/maintenance */}
          <button style={{
            display: 'flex', alignItems: 'center', gap: 7, height: 36, padding: '0 14px',
            background: 'var(--brand)', color: '#fff',
            border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>
            <Plus size={15} strokeWidth={1.6} />New job
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {filtersOpen && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '16px 18px', marginBottom: 14,
          display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Severity</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {SEV_FILTERS.map(f => (
                <button key={f.key} onClick={() => setSevFilter(f.key)} style={chipBtn(sevFilter === f.key, f.color)}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          {sevFilter !== 'all' && (
            <button onClick={() => setSevFilter('all')} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 12, color: 'var(--faint)', border: 'none',
              background: 'transparent', cursor: 'pointer',
            }}>
              <X size={13} />Clear filters
            </button>
          )}
        </div>
      )}

      {/* Status tabs + Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <div style={{
          display: 'flex', gap: 3,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 10, padding: 4,
        }}>
          {STATUS_TABS.map(t => (
            <button key={t.key} onClick={() => setStatTab(t.key)} style={{
              fontSize: 12.5, fontWeight: 500, padding: '6px 11px', borderRadius: 7,
              border: 'none', cursor: 'pointer',
              background: statTab === t.key ? 'var(--ink)' : 'transparent',
              color: statTab === t.key ? 'var(--bg)' : 'var(--muted)',
            }}>
              {t.label}{' '}
              <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 10, opacity: 0.65 }}>{statCounts[t.key] ?? 0}</span>
            </button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, height: 36, padding: '0 12px',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 10, color: 'var(--faint)', minWidth: 240,
          }}>
            <Search size={14} strokeWidth={1.6} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by motorcycle, plate, job…"
              style={{ fontSize: 13, background: 'transparent', border: 'none', outline: 'none', color: 'var(--ink)', width: '100%' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--faint)', display: 'flex' }}>
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ ...card, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '12px 2fr 1.4fr 1fr 80px 80px 100px 70px',
          gap: 12, alignItems: 'center', padding: '11px 20px',
          background: 'var(--surface-2)',
          borderBottom: '1px solid var(--border-2)',
        }}>
          <button style={colBtn} onClick={() => toggleSort('sev')} title="Sort by severity">
            <SortIcon field="sev" />
          </button>
          <button style={colBtn} onClick={() => toggleSort('moto')}>
            Motorcycle <SortIcon field="moto" />
          </button>
          <span style={{ ...colBtn, cursor: 'default' }}>Job</span>
          <button style={colBtn} onClick={() => toggleSort('date')}>
            Due date <SortIcon field="date" />
          </button>
          <span style={{ ...colBtn, cursor: 'default' }}>Mileage</span>
          <button style={colBtn} onClick={() => toggleSort('cost')}>
            Est. cost <SortIcon field="cost" />
          </button>
          <button style={colBtn} onClick={() => toggleSort('status')}>
            Status <SortIcon field="status" />
          </button>
          <span />
        </div>

        {sorted.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--faint)', fontSize: 13 }}>
            No maintenance records found.
          </div>
        ) : (
          sorted.map(m => (
            <div key={m.id} style={{
              display: 'grid', gridTemplateColumns: '12px 2fr 1.4fr 1fr 80px 80px 100px 70px',
              gap: 12, alignItems: 'center', padding: '12px 20px',
              borderTop: '1px solid var(--border-2)', fontSize: 12.5,
            }}>
              <span style={{
                display: 'block', width: 7, height: 7, borderRadius: 999,
                background: sevColor[m.sev as Sev], flexShrink: 0,
              }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--brand)', flexShrink: 0,
                }}>
                  <Wrench size={14} strokeWidth={1.6} />
                </div>
                <div>
                  <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{m.moto}</div>
                  <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: 10.5, color: 'var(--faint)' }}>{m.plate}</div>
                </div>
              </div>
              <span style={{ color: 'var(--muted)' }}>{m.type}</span>
              <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 12, color: m.sev === 'critical' ? 'var(--cmy-red)' : m.sev === 'warning' ? 'var(--cmy-amber)' : 'var(--faint)' }}>
                {m.date}
              </span>
              <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 11.5, color: 'var(--muted)' }}>{m.km} km</span>
              <span style={{ fontFamily: "'Geist Mono',monospace", fontWeight: 500, color: 'var(--ink)' }}>€{m.cost}</span>
              <Pill stat={m.status as Stat} />
              <button
                onClick={() => setDetailItem(m)}
                style={{
                  height: 28, padding: '0 10px', border: '1px solid var(--border)',
                  background: 'transparent', borderRadius: 7, fontSize: 11.5,
                  color: 'var(--muted)', cursor: 'pointer',
                }}>Details</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
