import { useState } from 'react';
import { Bike, Plus, SlidersHorizontal, ArrowUpDown, Search, Ellipsis, ChevronLeft, ChevronRight, X, ArrowUp, ArrowDown } from 'lucide-react';
import type { Moto, MotoStatus } from '../types';
import { useMotos } from '../hooks/useMotos';
import { ConfirmDialog } from '@/core/components/ui/ConfirmDialog';
import { Button } from '@/core/components/ui/Button';
import { DropdownMenu, DropdownMenuItem } from '@/core/components/ui/DropdownMenu';
import { CreateMotoModal } from '../components/CreateMotoModal';
import { EditMotoModal } from '../components/EditMotoModal';
import { MotoDetailModal } from '../components/MotoDetailModal';
import { ChangeMotoStatusModal } from '../components/ChangeMotoStatusModal';
import { TableSkeleton } from '@/core/components/ui/Skeleton';
import { ErrorState } from '@/core/components/ui/ErrorState';
import { useToast } from '@/core/components/ToastProvider';
import { useAsync } from '@/core/hooks/useAsync';
import { api } from '@/core/services/api';

type SortField = 'brand' | 'mileage' | 'pricePerDay' | 'status';
type SortDir = 'asc' | 'desc';

const STATUS_TABS: { key: MotoStatus | 'all'; label: string }[] = [
  { key: 'all',         label: 'All'         },
  { key: 'available',   label: 'Available'   },
  { key: 'reserved',    label: 'On rent'     },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'inactive',    label: 'Inactive'    },
];

const PAGE_SIZE = 10;

const statusCfg: Record<MotoStatus, { label: string; color: string; bg: string }> = {
  available:   { label: 'Available',   color: 'var(--cmy-green)', bg: 'color-mix(in srgb,var(--cmy-green) 13%,transparent)' },
  reserved:    { label: 'On rent',     color: 'var(--brand)',     bg: 'var(--brand-tint)' },
  maintenance: { label: 'Maintenance', color: 'var(--cmy-amber)', bg: 'color-mix(in srgb,var(--cmy-amber) 15%,transparent)' },
  inactive:    { label: 'Inactive',    color: 'var(--faint)',     bg: 'color-mix(in srgb,var(--faint) 16%,transparent)' },
};

function StatusPill({ status }: { status: MotoStatus }) {
  const c = statusCfg[status] ?? statusCfg.inactive;
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

function RowActionsMenu({ anchorRect, onClose, onDelete, onEdit, onView, onChangeStatus }: {
  anchorRect: DOMRect;
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onView: () => void;
  onChangeStatus: () => void;
}) {
  return (
    <DropdownMenu anchorRect={anchorRect} onClose={onClose} minWidth={160}>
      <DropdownMenuItem onClick={() => { onClose(); onView(); }}>View details</DropdownMenuItem>
      <DropdownMenuItem onClick={() => { onClose(); onEdit(); }}>Edit</DropdownMenuItem>
      <DropdownMenuItem onClick={() => { onClose(); onChangeStatus(); }}>Change status</DropdownMenuItem>
      <div style={{ borderTop: '1px solid var(--border-2)', marginTop: 4, paddingTop: 4 }}>
        <DropdownMenuItem color="var(--cmy-red)" onClick={() => { onClose(); onDelete(); }}>Delete</DropdownMenuItem>
      </div>
    </DropdownMenu>
  );
}

export function MotoListPage() {
  const [page, setPage] = useState(1);
  const { data: motos, isLoading, error: fetchError, refetch } = useMotos({ page, limit: PAGE_SIZE });
  const { success, error } = useToast();

  const [tab, setTab] = useState<MotoStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [sort, setSort] = useState<{ field: SortField; dir: SortDir }>({ field: 'brand', dir: 'asc' });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openMenu, setOpenMenu] = useState<{ id: string; rect: DOMRect } | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Moto | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Moto | null>(null);
  const [detailTarget, setDetailTarget] = useState<Moto | null>(null);
  const [statusTarget, setStatusTarget] = useState<Moto | null>(null);

  const deleteAction = useAsync((id: string) => api.delete(`/motos/${id}`));

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteAction.execute(deleteTarget.id);
    if (result !== undefined) {
      success('Motorcycle deleted');
      refetch();
      setDeleteTarget(null);
    } else {
      error('Failed to delete motorcycle');
    }
  };

  const categories = Array.from(new Set(motos.map(m => m.category)));

  const counts = STATUS_TABS.reduce((acc, t) => {
    acc[t.key] = t.key === 'all'
      ? motos.length
      : motos.filter(m => m.status === t.key).length;
    return acc;
  }, {} as Record<string, number>);

  const filtered = motos
    .filter(m => {
      const matchTab = tab === 'all' || m.status === tab;
      const matchCat = catFilter === 'all' || m.category === catFilter;
      const matchSearch = !search ||
        m.brand.toLowerCase().includes(search.toLowerCase()) ||
        m.model.toLowerCase().includes(search.toLowerCase()) ||
        m.plate.toLowerCase().includes(search.toLowerCase());
      return matchTab && matchCat && matchSearch;
    })
    .sort((a, b) => {
      const dir = sort.dir === 'asc' ? 1 : -1;
      if (sort.field === 'brand') return dir * (a.brand + a.model).localeCompare(b.brand + b.model);
      if (sort.field === 'mileage') return dir * (a.mileage - b.mileage);
      if (sort.field === 'pricePerDay') return dir * (a.pricePerDay - b.pricePerDay);
      if (sort.field === 'status') return dir * a.status.localeCompare(b.status);
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (field: SortField) => {
    setSort(s => s.field === field
      ? { field, dir: s.dir === 'asc' ? 'desc' : 'asc' }
      : { field, dir: 'asc' }
    );
    setPage(1);
  };

  const allOnPageSelected = paginated.length > 0 && paginated.every(m => selectedIds.has(m.id));
  const someSelected = paginated.some(m => selectedIds.has(m.id));

  const toggleAll = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allOnPageSelected) paginated.forEach(m => next.delete(m.id));
      else paginated.forEach(m => next.add(m.id));
      return next;
    });
  };

  const toggleRow = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sort.field !== field) return <ArrowUpDown size={11} style={{ opacity: 0.4 }} />;
    return sort.dir === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />;
  };

  const card: React.CSSProperties = {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 16, boxShadow: 'var(--shadow)', overflow: 'hidden',
  };

  const colBtn: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: "'Geist Mono',monospace", fontSize: 10,
    letterSpacing: '.08em', textTransform: 'uppercase',
    color: 'var(--faint)', padding: 0,
  };

  return (
    <div>
      {createOpen && (
        <CreateMotoModal onClose={() => setCreateOpen(false)} onCreated={refetch} />
      )}

      {editTarget && (
        <EditMotoModal moto={editTarget} onClose={() => setEditTarget(null)} onUpdated={refetch} />
      )}

      {detailTarget && (
        <MotoDetailModal moto={detailTarget} onClose={() => setDetailTarget(null)} />
      )}

      {statusTarget && (
        <ChangeMotoStatusModal moto={statusTarget} onClose={() => setStatusTarget(null)} onUpdated={refetch} />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete motorcycle"
          message={`Are you sure you want to permanently delete ${deleteTarget.brand} ${deleteTarget.model} (${deleteTarget.plate})? This action cannot be undone.`}
          confirmLabel="Delete"
          danger
          isLoading={deleteAction.isLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "'Cormorant Garamond',serif", fontSize: 30, fontWeight: 600, letterSpacing: '.01em', lineHeight: 1.05, color: 'var(--ink)' }}>Fleet</h1>
          <p style={{ margin: '5px 0 0', fontSize: 13.5, color: 'var(--muted)' }}>
            {isLoading ? (
              <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 12, color: 'var(--faint)' }}>Loading…</span>
            ) : (
              <>
                {motos.length} motorcycles ·{' '}
                <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 12 }}>
                  {counts['available'] ?? 0} available
                </span> ·{' '}
                <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 12, color: 'var(--cmy-amber)' }}>
                  {counts['maintenance'] ?? 0} in service
                </span>
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
            {(catFilter !== 'all') && (
              <span style={{
                background: 'var(--brand)', color: '#fff',
                borderRadius: 999, width: 16, height: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontFamily: "'Geist Mono',monospace",
              }}>1</span>
            )}
          </Button>
          <Button size="md" onClick={() => setCreateOpen(true)}>
            <Plus size={15} strokeWidth={1.6} />Add motorcycle
          </Button>
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
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Category</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['all', ...categories].map(c => (
                <button key={c} onClick={() => { setCatFilter(c); setPage(1); }} style={{
                  padding: '4px 10px', borderRadius: 7, fontSize: 12,
                  border: '1px solid var(--border)',
                  background: catFilter === c ? 'var(--ink)' : 'transparent',
                  color: catFilter === c ? 'var(--bg)' : 'var(--muted)',
                  cursor: 'pointer',
                }}>
                  {c === 'all' ? 'All categories' : c}
                </button>
              ))}
            </div>
          </div>
          <button
            disabled={catFilter === 'all'}
            onClick={() => { setCatFilter('all'); setPage(1); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 12, color: 'var(--faint)', border: 'none',
              background: 'transparent', cursor: catFilter === 'all' ? 'default' : 'pointer',
              opacity: catFilter === 'all' ? 0.4 : 1,
            }}
          >
            <X size={13} />Clear filters
          </button>
        </div>
      )}

      {/* Tabs + search row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <div style={{
          display: 'flex', gap: 3,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 10, padding: 4,
        }}>
          {STATUS_TABS.map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setPage(1); }} style={{
              fontSize: 12.5, fontWeight: 500, padding: '6px 11px', borderRadius: 7,
              border: 'none', cursor: 'pointer',
              background: tab === t.key ? 'var(--ink)' : 'transparent',
              color: tab === t.key ? 'var(--bg)' : 'var(--muted)',
            }}>
              {t.label}{' '}
              <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 10, opacity: 0.65 }}>{counts[t.key] ?? 0}</span>
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
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search fleet…"
              style={{ fontSize: 13, background: 'transparent', border: 'none', outline: 'none', color: 'var(--ink)', width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 16px', marginBottom: 10,
          background: 'var(--brand-tint)', border: '1px solid var(--border)',
          borderRadius: 10, fontSize: 13,
        }}>
          <span style={{ color: 'var(--brand)', fontWeight: 500 }}>{selectedIds.size} selected</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {/* TODO: bulk delete + bulk status change */}
            <Button variant="secondary" size="sm" onClick={() => setSelectedIds(new Set())}>Clear selection</Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={card}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '34px 2.4fr 1fr 1.15fr 1fr 1.1fr 1.2fr .7fr 36px',
          gap: 12, alignItems: 'center', padding: '11px 18px',
          background: 'var(--surface-2)',
          borderBottom: '1px solid var(--border-2)',
        }}>
          <input
            type="checkbox"
            checked={allOnPageSelected}
            ref={el => { if (el) el.indeterminate = someSelected && !allOnPageSelected; }}
            onChange={toggleAll}
            aria-label="Select all"
            style={{ width: 15, height: 15, accentColor: 'var(--brand)', cursor: 'pointer' }}
          />
          <button style={colBtn} onClick={() => toggleSort('brand')}>
            Motorcycle <SortIcon field="brand" />
          </button>
          <span style={{ ...colBtn, cursor: 'default' }}>Category</span>
          <button style={colBtn} onClick={() => toggleSort('status')}>
            Status <SortIcon field="status" />
          </button>
          <button style={colBtn} onClick={() => toggleSort('mileage')}>
            Mileage <SortIcon field="mileage" />
          </button>
          <span style={{ ...colBtn, cursor: 'default' }}>Next service</span>
          <span style={{ ...colBtn, cursor: 'default' }}>Location</span>
          <button style={colBtn} onClick={() => toggleSort('pricePerDay')}>
            Rate <SortIcon field="pricePerDay" />
          </button>
          <span />
        </div>

        {isLoading ? (
          <TableSkeleton gridTemplateColumns="34px 2.4fr 1fr 1.15fr 1fr 1.1fr 1.2fr .7fr 36px" columns={9} />
        ) : fetchError ? (
          <ErrorState message="Impossible de charger la flotte." onRetry={refetch} />
        ) : paginated.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--faint)', fontSize: 13 }}>
            No motorcycles found.
          </div>
        ) : (
          paginated.map((moto) => (
            <div key={moto.id} onClick={() => setDetailTarget(moto)} style={{
              display: 'grid',
              gridTemplateColumns: '34px 2.4fr 1fr 1.15fr 1fr 1.1fr 1.2fr .7fr 36px',
              gap: 12, alignItems: 'center', padding: '11px 18px',
              borderTop: '1px solid var(--border-2)', fontSize: 12.5,
              background: selectedIds.has(moto.id) ? 'var(--brand-tint)' : undefined,
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={selectedIds.has(moto.id)}
                onChange={() => toggleRow(moto.id)}
                onClick={e => e.stopPropagation()}
                aria-label={`Select ${moto.brand} ${moto.model}`}
                style={{ width: 15, height: 15, accentColor: 'var(--brand)', cursor: 'pointer' }}
              />
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
              <span style={{ fontFamily: "'Geist Mono',monospace", color: 'var(--muted)', fontSize: 12 }}>
                {moto.nextServiceDate
                  ? new Date(moto.nextServiceDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '—'}
              </span>
              <span style={{ fontFamily: "'Geist Mono',monospace", color: 'var(--muted)', fontSize: 12 }}>
                {moto.location}
              </span>
              <span style={{ fontFamily: "'Geist Mono',monospace", color: 'var(--ink)' }}>€{moto.pricePerDay}</span>
              <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                <button
                  onClick={(e) => setOpenMenu(openMenu?.id === moto.id ? null : { id: moto.id, rect: e.currentTarget.getBoundingClientRect() })}
                  aria-label="Row actions"
                  style={{
                    width: 28, height: 28, border: 'none', background: 'transparent',
                    borderRadius: 7, color: 'var(--faint)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Ellipsis size={15} strokeWidth={1.6} />
                </button>
                {openMenu?.id === moto.id && (
                  <RowActionsMenu
                    anchorRect={openMenu.rect}
                    onClose={() => setOpenMenu(null)}
                    onDelete={() => setDeleteTarget(moto)}
                    onEdit={() => setEditTarget(moto)}
                    onView={() => setDetailTarget(moto)}
                    onChangeStatus={() => setStatusTarget(moto)}
                  />
                )}
              </div>
            </div>
          ))
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 18px', borderTop: '1px solid var(--border-2)',
            background: 'var(--surface-2)',
          }}>
            <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 11, color: 'var(--faint)' }}>
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 30, height: 30, borderRadius: 8,
                  border: '1px solid var(--border)', background: 'var(--surface)',
                  color: page === 1 ? 'var(--border)' : 'var(--ink)', cursor: page === 1 ? 'default' : 'pointer',
                }}
              ><ChevronLeft size={14} /></button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 30, height: 30, borderRadius: 8,
                  border: '1px solid var(--border)', background: 'var(--surface)',
                  color: page === totalPages ? 'var(--border)' : 'var(--ink)', cursor: page === totalPages ? 'default' : 'pointer',
                }}
              ><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
