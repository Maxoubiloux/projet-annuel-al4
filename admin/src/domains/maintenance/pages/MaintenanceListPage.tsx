import { useState } from 'react';
import { Plus, Wrench, X, SlidersHorizontal, Search, ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/core/components/ui/Button';
import type { MaintenanceJob, MaintenanceSeverity, MaintenanceStatus } from '../types';
import { useMaintenance } from '../hooks/useMaintenance';
import { CreateMaintenanceModal } from '../components/CreateMaintenanceModal';
import { useToast } from '@/core/components/ToastProvider';
import { useAsync } from '@/core/hooks/useAsync';
import { api } from '@/core/services/api';
import { TableSkeleton } from '@/core/components/ui/Skeleton';
import { ErrorState } from '@/core/components/ui/ErrorState';

type SortField = 'moto' | 'date' | 'cost' | 'status' | 'sev';
type SortDir = 'asc' | 'desc';

const SEV_ORDER: Record<MaintenanceSeverity, number>  = { critical: 0, warning: 1, ok: 2 };
const STAT_ORDER: Record<MaintenanceStatus, number> = { open: 0, scheduled: 1, completed: 2 };

const sevColor: Record<MaintenanceSeverity, string> = {
  critical: 'var(--cmy-red)',
  warning:  'var(--cmy-amber)',
  ok:       'var(--cmy-green)',
};

const statCfg: Record<MaintenanceStatus, { label: string; color: string; bg: string }> = {
  open:      { label: 'Open',      color: 'var(--cmy-red)',   bg: 'color-mix(in srgb,var(--cmy-red) 14%,transparent)'   },
  scheduled: { label: 'Scheduled', color: 'var(--cmy-amber)', bg: 'color-mix(in srgb,var(--cmy-amber) 15%,transparent)' },
  completed: { label: 'Done',      color: 'var(--cmy-green)', bg: 'color-mix(in srgb,var(--cmy-green) 13%,transparent)' },
};

function Pill({ stat }: { stat: MaintenanceStatus }) {
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
function DetailModal({ item, onClose, onUpdated }: { item: MaintenanceJob; onClose: () => void; onUpdated: () => void }) {
  const { success, error } = useToast();
  const [notes, setNotes] = useState(item.notes ?? '');
  const notesDirty = notes !== (item.notes ?? '');
  const [cost, setCost] = useState(String(item.cost));
  const costDirty = cost !== String(item.cost) && cost !== '' && !Number.isNaN(Number(cost));

  const markDoneAction = useAsync(() => api.patch(`/maintenance/${item.id}`, { status: 'completed' }));
  const saveNotesAction = useAsync(() => api.patch(`/maintenance/${item.id}`, { notes }));
  const saveCostAction = useAsync(() => api.patch(`/maintenance/${item.id}`, { cost: Number(cost) }));

  const handleMarkDone = async () => {
    const result = await markDoneAction.execute();
    if (result !== undefined) {
      success('Job marked as done');
      onUpdated();
      onClose();
    } else {
      error('Failed to update job');
    }
  };

  const handleSaveNotes = async () => {
    const result = await saveNotesAction.execute();
    if (result !== undefined) {
      success('Notes saved');
      onUpdated();
    } else {
      error('Failed to save notes');
    }
  };

  const handleSaveCost = async () => {
    const result = await saveCostAction.execute();
    if (result !== undefined) {
      success('Cost saved');
      onUpdated();
    } else {
      error('Failed to save cost');
    }
  };

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
            <span style={{ width: 10, height: 10, borderRadius: 999, background: sevColor[item.sev], flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 600, color: 'var(--ink)' }}>{item.type}</div>
              <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 2 }}>{item.moto} · {item.plate}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--faint)', padding: 4 }}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <InfoRow label="Due date" value={item.date} />
          <InfoRow label="Mileage" value={`${item.km} km`} />
          <div>
            <div style={{ fontSize: 11, color: 'var(--faint)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: "'Geist Mono',monospace" }}>Estimated cost</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
                <span style={{ fontSize: 13, color: 'var(--faint)' }}>€</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={cost}
                  onChange={e => setCost(e.target.value)}
                  style={{
                    width: '100%', padding: '7px 10px',
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    borderRadius: 8, fontSize: 13, color: 'var(--ink)',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              {costDirty && (
                <Button
                  variant="secondary" size="sm"
                  disabled={saveCostAction.isLoading}
                  onClick={handleSaveCost}
                >
                  {saveCostAction.isLoading ? 'Saving…' : 'Save'}
                </Button>
              )}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--faint)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: "'Geist Mono',monospace" }}>Status</div>
            <Pill stat={item.status} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--faint)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: "'Geist Mono',monospace" }}>Notes</div>
            <textarea
              placeholder="Add notes about this job…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{
                width: '100%', minHeight: 70, padding: '8px 10px',
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: 8, fontSize: 13, color: 'var(--ink)',
                resize: 'vertical', outline: 'none',
                fontFamily: "'Geist',system-ui,sans-serif",
                boxSizing: 'border-box',
              }}
            />
            {notesDirty && (
              <Button
                variant="secondary" size="sm" style={{ marginTop: 8 }}
                disabled={saveNotesAction.isLoading}
                onClick={handleSaveNotes}
              >
                {saveNotesAction.isLoading ? 'Saving…' : 'Save notes'}
              </Button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--border-2)' }}>
          <Button variant="secondary" size="md" style={{ flex: 1 }} onClick={onClose}>Close</Button>
          {item.status !== 'completed' && (
            <Button size="md" style={{ flex: 1 }} disabled={markDoneAction.isLoading} onClick={handleMarkDone}>
              {markDoneAction.isLoading ? 'Updating…' : 'Mark as done'}
            </Button>
          )}
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

const STATUS_TABS: { key: MaintenanceStatus | 'all'; label: string }[] = [
  { key: 'all',       label: 'All'       },
  { key: 'open',      label: 'Open'      },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'completed', label: 'Done'      },
];

const SEV_FILTERS: { key: MaintenanceSeverity | 'all'; label: string; color?: string }[] = [
  { key: 'all',      label: 'All'      },
  { key: 'critical', label: 'Critical', color: 'var(--cmy-red)'   },
  { key: 'warning',  label: 'Warning',  color: 'var(--cmy-amber)' },
  { key: 'ok',       label: 'OK',       color: 'var(--cmy-green)' },
];

const PAGE_SIZE = 10;

export function MaintenanceListPage() {
  const [page, setPage] = useState(1);
  const { data: jobs, isLoading, error: fetchError, refetch } = useMaintenance({ page, limit: PAGE_SIZE });

  const [statTab, setStatTab] = useState<MaintenanceStatus | 'all'>('all');
  const [sevFilter, setSevFilter] = useState<MaintenanceSeverity | 'all'>('all');
  const [detailItem, setDetailItem] = useState<MaintenanceJob | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{ field: SortField; dir: SortDir }>({ field: 'date', dir: 'asc' });
  const [createOpen, setCreateOpen] = useState(false);

  const statCounts = STATUS_TABS.reduce((acc, t) => {
    acc[t.key] = t.key === 'all'
      ? jobs.length
      : jobs.filter(m => m.status === t.key).length;
    return acc;
  }, {} as Record<string, number>);

  const filtered = jobs.filter(m => {
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
    if (sort.field === 'status') return d * (STAT_ORDER[a.status] - STAT_ORDER[b.status]);
    if (sort.field === 'sev')    return d * (SEV_ORDER[a.sev] - SEV_ORDER[b.sev]);
    return 0;
  });

  const open = jobs.filter(m => m.status === 'open').length;
  const activeFilterCount = sevFilter !== 'all' ? 1 : 0;

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (field: SortField) => {
    setSort(s => s.field === field
      ? { field, dir: s.dir === 'asc' ? 'desc' : 'asc' }
      : { field, dir: 'asc' });
    setPage(1);
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
      {detailItem && <DetailModal item={detailItem} onClose={() => setDetailItem(null)} onUpdated={refetch} />}

      {createOpen && (
        <CreateMaintenanceModal onClose={() => setCreateOpen(false)} onCreated={refetch} />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "'Cormorant Garamond',serif", fontSize: 30, fontWeight: 600, letterSpacing: '.01em', lineHeight: 1.05, color: 'var(--ink)' }}>Maintenance</h1>
          <p style={{ margin: '5px 0 0', fontSize: 13.5, color: 'var(--muted)' }}>
            {isLoading ? (
              <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 12, color: 'var(--faint)' }}>Loading…</span>
            ) : (
              <>
                {jobs.length} records ·{' '}
                <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 12, color: 'var(--cmy-red)' }}>{open} open</span>
              </>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button
            variant={filtersOpen ? 'secondary' : 'outline'}
            size="md"
            onClick={() => setFiltersOpen(o => !o)}
            style={filtersOpen ? { background: 'var(--surface-2)' } : undefined}
          >
            <SlidersHorizontal size={15} strokeWidth={1.6} />Filters
            {activeFilterCount > 0 && (
              <span style={{ background: 'var(--brand)', color: '#fff', borderRadius: 999, width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontFamily: "'Geist Mono',monospace" }}>{activeFilterCount}</span>
            )}
          </Button>
          <Button size="md" onClick={() => setCreateOpen(true)}>
            <Plus size={15} strokeWidth={1.6} />New job
          </Button>
        </div>
      </div>

      {/* Filters panel */}
      {filtersOpen && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Severity</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {SEV_FILTERS.map(f => (
                <button key={f.key} onClick={() => { setSevFilter(f.key); setPage(1); }} style={chipBtn(sevFilter === f.key, f.color)}>{f.label}</button>
              ))}
            </div>
          </div>
          {sevFilter !== 'all' && (
            <button onClick={() => { setSevFilter('all'); setPage(1); }} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--faint)', border: 'none', background: 'transparent', cursor: 'pointer' }}>
              <X size={13} />Clear filters
            </button>
          )}
        </div>
      )}

      {/* Status tabs + Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 3, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 4 }}>
          {STATUS_TABS.map(t => (
            <button key={t.key} onClick={() => { setStatTab(t.key); setPage(1); }} style={{ fontSize: 12.5, fontWeight: 500, padding: '6px 11px', borderRadius: 7, border: 'none', cursor: 'pointer', background: statTab === t.key ? 'var(--ink)' : 'transparent', color: statTab === t.key ? 'var(--bg)' : 'var(--muted)' }}>
              {t.label}{' '}
              <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 10, opacity: 0.65 }}>{statCounts[t.key] ?? 0}</span>
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 36, padding: '0 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--faint)', minWidth: 240 }}>
            <Search size={14} strokeWidth={1.6} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by motorcycle, plate, job…" style={{ fontSize: 13, background: 'transparent', border: 'none', outline: 'none', color: 'var(--ink)', width: '100%' }} />
            {search && (
              <button onClick={() => { setSearch(''); setPage(1); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--faint)', display: 'flex' }}><X size={13} /></button>
            )}
          </div>
        </div>
      </div>

      <div style={{ ...card, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '12px 2fr 1.4fr 1fr 80px 80px 100px 70px', gap: 12, alignItems: 'center', padding: '11px 20px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border-2)' }}>
          <button style={colBtn} onClick={() => toggleSort('sev')} title="Sort by severity"><SortIcon field="sev" /></button>
          <button style={colBtn} onClick={() => toggleSort('moto')}>Motorcycle <SortIcon field="moto" /></button>
          <span style={{ ...colBtn, cursor: 'default' }}>Job</span>
          <button style={colBtn} onClick={() => toggleSort('date')}>Due date <SortIcon field="date" /></button>
          <span style={{ ...colBtn, cursor: 'default' }}>Mileage</span>
          <button style={colBtn} onClick={() => toggleSort('cost')}>Est. cost <SortIcon field="cost" /></button>
          <button style={colBtn} onClick={() => toggleSort('status')}>Status <SortIcon field="status" /></button>
          <span />
        </div>

        {isLoading ? (
          <TableSkeleton gridTemplateColumns="12px 2fr 1.4fr 1fr 80px 80px 100px 70px" columns={8} />
        ) : fetchError ? (
          <ErrorState message="Impossible de charger les interventions." onRetry={refetch} />
        ) : paginated.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--faint)', fontSize: 13 }}>No maintenance records found.</div>
        ) : (
          paginated.map(m => (
            <div
              key={m.id}
              onClick={() => setDetailItem(m)}
              style={{ display: 'grid', gridTemplateColumns: '12px 2fr 1.4fr 1fr 80px 80px 100px 70px', gap: 12, alignItems: 'center', padding: '12px 20px', borderTop: '1px solid var(--border-2)', fontSize: 12.5, cursor: 'pointer' }}
            >
              <span style={{ display: 'block', width: 7, height: 7, borderRadius: 999, background: sevColor[m.sev], flexShrink: 0 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)', flexShrink: 0 }}>
                  <Wrench size={14} strokeWidth={1.6} />
                </div>
                <div>
                  <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{m.moto}</div>
                  <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: 10.5, color: 'var(--faint)' }}>{m.plate}</div>
                </div>
              </div>
              <span style={{ color: 'var(--muted)' }}>{m.type}</span>
              <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 12, color: m.sev === 'critical' ? 'var(--cmy-red)' : m.sev === 'warning' ? 'var(--cmy-amber)' : 'var(--faint)' }}>{m.date}</span>
              <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 11.5, color: 'var(--muted)' }}>{m.km} km</span>
              <span style={{ fontFamily: "'Geist Mono',monospace", fontWeight: 500, color: 'var(--ink)' }}>€{m.cost}</span>
              <Pill stat={m.status} />
              <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 11, color: 'var(--faint)' }}>Details →</span>
            </div>
          ))
        )}

        {/* Pagination */}
        {!isLoading && !fetchError && totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: '1px solid var(--border-2)', background: 'var(--surface-2)' }}>
            <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 11, color: 'var(--faint)' }}>
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: page === 1 ? 'var(--border)' : 'var(--ink)', cursor: page === 1 ? 'default' : 'pointer' }}><ChevronLeft size={14} /></button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: page === totalPages ? 'var(--border)' : 'var(--ink)', cursor: page === totalPages ? 'default' : 'pointer' }}><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
