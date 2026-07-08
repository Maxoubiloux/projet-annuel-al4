import { useState, useRef, useEffect } from 'react';
import { Search, Plus, SlidersHorizontal, Eye, Ellipsis, X, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import type { ReservationStatus, PaymentStatus, ReservationRow } from '../types';
import { useReservations } from '../hooks/useReservations';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ConfirmDialog } from '@/core/components/ui/ConfirmDialog';
import { Button } from '@/core/components/ui/Button';
import { CreateReservationModal } from '../components/CreateReservationModal';
import { useToast } from '@/core/components/ToastProvider';
import { useAsync } from '@/core/hooks/useAsync';
import { api } from '@/core/services/api';
import { TableSkeleton } from '@/core/components/ui/Skeleton';
import { ErrorState } from '@/core/components/ui/ErrorState';

type StatusConfig = { label: string; color: string; bg: string };

const resCfg: Record<ReservationStatus, StatusConfig> = {
  pending:     { label: 'Pending',    color: 'var(--cmy-amber)', bg: 'color-mix(in srgb,var(--cmy-amber) 15%,transparent)' },
  confirmed:   { label: 'Confirmed',  color: 'var(--cmy-green)', bg: 'color-mix(in srgb,var(--cmy-green) 13%,transparent)' },
  in_progress: { label: 'Active',     color: 'var(--brand)',     bg: 'var(--brand-tint)' },
  completed:   { label: 'Done',       color: 'var(--faint)',     bg: 'color-mix(in srgb,var(--faint) 16%,transparent)' },
  cancelled:   { label: 'Cancelled',  color: 'var(--cmy-red)',   bg: 'color-mix(in srgb,var(--cmy-red) 14%,transparent)' },
};

const payCfg: Record<PaymentStatus, StatusConfig> = {
  paid:     { label: 'Paid',     color: 'var(--cmy-green)', bg: 'color-mix(in srgb,var(--cmy-green) 13%,transparent)' },
  pending:  { label: 'Pending',  color: 'var(--cmy-amber)', bg: 'color-mix(in srgb,var(--cmy-amber) 15%,transparent)' },
  failed:   { label: 'Failed',   color: 'var(--cmy-red)',   bg: 'color-mix(in srgb,var(--cmy-red) 14%,transparent)' },
  refunded: { label: 'Refunded', color: 'var(--faint)',     bg: 'color-mix(in srgb,var(--faint) 16%,transparent)' },
};

function Pill({ config }: { config: StatusConfig }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontFamily: "'Geist Mono',monospace", fontSize: 9.5,
      textTransform: 'uppercase', letterSpacing: '.04em',
      padding: '3px 7px', borderRadius: 999,
      color: config.color, background: config.bg,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: 999, background: config.color }} />
      {config.label}
    </span>
  );
}

type SortField = 'startDate' | 'totalAmount' | 'status';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 10;

const STATUS_TABS: { key: ReservationStatus | 'all'; label: string }[] = [
  { key: 'all',         label: 'All'       },
  { key: 'pending',     label: 'Pending'   },
  { key: 'confirmed',   label: 'Confirmed' },
  { key: 'in_progress', label: 'Active'    },
  { key: 'completed',   label: 'Done'      },
  { key: 'cancelled',   label: 'Cancelled' },
];

const PAY_FILTERS: { key: PaymentStatus | 'all'; label: string; color?: string }[] = [
  { key: 'all',      label: 'All'      },
  { key: 'paid',     label: 'Paid',     color: 'var(--cmy-green)' },
  { key: 'pending',  label: 'Pending',  color: 'var(--cmy-amber)' },
  { key: 'failed',   label: 'Failed',   color: 'var(--cmy-red)'   },
  { key: 'refunded', label: 'Refunded'                             },
];

/* ── Detail modal ── */
function DetailModal({ row, onClose, onConfirm, confirming }: { row: ReservationRow; onClose: () => void; onConfirm: () => void; confirming: boolean }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,.45)',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 18, boxShadow: 'var(--shadow)',
        width: 480, maxWidth: '95vw', padding: '28px 28px 24px',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 600, color: 'var(--ink)' }}>
              Reservation #{row.id.toUpperCase().slice(0, 6)}
            </div>
            <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 3 }}>Created {format(parseISO(row.createdAt), 'dd MMM yyyy', { locale: fr })}</div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--faint)', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <InfoRow label="Customer" value={`${row.customer?.firstName} ${row.customer?.lastName}`} sub={row.customer?.phone} />
          <InfoRow label="Motorcycle" value={`${row.moto?.brand} ${row.moto?.model}`} sub={row.moto?.plate} />
          <InfoRow
            label="Period"
            value={`${format(parseISO(row.startDate), 'dd MMM yyyy', { locale: fr })} → ${format(parseISO(row.endDate), 'dd MMM yyyy', { locale: fr })}`}
          />
          <InfoRow label="Amount" value={`${row.totalAmount} €`} />
          <InfoRow label="Deposit" value={`${row.depositAmount} €`} />
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--faint)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: "'Geist Mono',monospace" }}>Status</div>
              <Pill config={resCfg[row.status]} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--faint)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: "'Geist Mono',monospace" }}>Payment</div>
              <Pill config={payCfg[row.paymentStatus]} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--border-2)' }}>
          <Button variant="secondary" size="md" style={{ flex: 1 }} onClick={onClose}>Close</Button>
          {row.status === 'pending' && (
            <Button size="md" style={{ flex: 1 }} disabled={confirming} onClick={onConfirm}>
              {confirming ? 'Confirming…' : 'Confirm'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--faint)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: "'Geist Mono',monospace" }}>{label}</div>
      <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: 'var(--faint)', marginTop: 1 }}>{sub}</div>}
    </div>
  );
}

/* ── Row actions dropdown ── */
function RowActions({
  status, onView, onConfirm, onCancel, onRefund,
}: {
  status: ReservationStatus;
  onView: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  onRefund: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div style={{ display: 'flex', gap: 4, position: 'relative' }}>
      <button onClick={onView} aria-label="View reservation" style={{ width: 26, height: 26, border: 'none', background: 'transparent', borderRadius: 6, color: 'var(--faint)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Eye size={13} strokeWidth={1.6} />
      </button>
      <div ref={ref}>
        <button onClick={() => setOpen(o => !o)} aria-label="More actions" style={{ width: 26, height: 26, border: 'none', background: 'transparent', borderRadius: 6, color: 'var(--faint)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Ellipsis size={13} strokeWidth={1.6} />
        </button>
        {open && (
          <div style={{
            position: 'absolute', right: 0, top: 30,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 10, boxShadow: 'var(--shadow)',
            minWidth: 150, padding: 5, zIndex: 50,
          }}>
            {status === 'pending' && (
              <button onClick={() => { setOpen(false); onConfirm(); }} style={{ display: 'block', width: '100%', padding: '7px 10px', textAlign: 'left', fontSize: 12.5, color: 'var(--ink)', border: 'none', background: 'transparent', borderRadius: 7, cursor: 'pointer' }}>Confirm</button>
            )}
            {status !== 'cancelled' && status !== 'completed' && (
              <button onClick={() => { setOpen(false); onCancel(); }} style={{ display: 'block', width: '100%', padding: '7px 10px', textAlign: 'left', fontSize: 12.5, color: 'var(--cmy-red)', border: 'none', background: 'transparent', borderRadius: 7, cursor: 'pointer' }}>Cancel</button>
            )}
            <button onClick={() => { setOpen(false); onRefund(); }} style={{ display: 'block', width: '100%', padding: '7px 10px', textAlign: 'left', fontSize: 12.5, color: 'var(--cmy-amber)', border: 'none', background: 'transparent', borderRadius: 7, cursor: 'pointer' }}>Refund</button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ReservationListPage() {
  const [page, setPage] = useState(1);
  const { data: allRows, isLoading, error: fetchError, refetch } = useReservations({ page, limit: PAGE_SIZE });
  const { success, error } = useToast();

  const [search, setSearch] = useState('');
  const [tabFilter, setTabFilter] = useState<ReservationStatus | 'all'>('all');
  const [payFilter, setPayFilter] = useState<PaymentStatus | 'all'>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [sort, setSort] = useState<{ field: SortField; dir: SortDir }>({ field: 'startDate', dir: 'desc' });
  const [detailRow, setDetailRow] = useState<ReservationRow | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ReservationRow | null>(null);
  const [refundTarget, setRefundTarget] = useState<ReservationRow | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const confirmAction = useAsync((id: string) => api.post(`/reservations/${id}/confirm`));
  const cancelAction = useAsync((id: string) => api.post(`/reservations/${id}/cancel`));
  const refundAction = useAsync((id: string) => api.post(`/reservations/${id}/refund`));

  const handleConfirm = async (row: ReservationRow) => {
    const result = await confirmAction.execute(row.id);
    if (result !== undefined) {
      success('Reservation confirmed');
      refetch();
      setDetailRow(null);
    } else {
      error('Failed to confirm reservation');
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    const result = await cancelAction.execute(cancelTarget.id);
    if (result !== undefined) {
      success('Reservation cancelled');
      refetch();
      setCancelTarget(null);
    } else {
      error('Failed to cancel reservation');
    }
  };

  const handleRefund = async () => {
    if (!refundTarget) return;
    const result = await refundAction.execute(refundTarget.id);
    if (result !== undefined) {
      success('Refund issued');
      refetch();
      setRefundTarget(null);
    } else {
      error('Failed to issue refund');
    }
  };

  const pendingCount = allRows.filter(r => r.status === 'pending').length;
  const activeFilterCount = [payFilter !== 'all', !!dateFrom, !!dateTo, !!minAmount, !!maxAmount].filter(Boolean).length;

  const tabCounts = STATUS_TABS.reduce((acc, t) => {
    acc[t.key] = t.key === 'all' ? allRows.length : allRows.filter(r => r.status === t.key).length;
    return acc;
  }, {} as Record<string, number>);

  const filtered = allRows
    .filter(r => {
      const matchTab    = tabFilter === 'all' || r.status === tabFilter;
      const matchPay    = payFilter === 'all' || r.paymentStatus === payFilter;
      const matchSearch = !search ||
        r.id.includes(search) ||
        r.customer?.lastName.toLowerCase().includes(search.toLowerCase()) ||
        r.moto?.brand.toLowerCase().includes(search.toLowerCase());
      const matchFrom   = !dateFrom || r.startDate >= dateFrom;
      const matchTo     = !dateTo   || r.startDate <= dateTo;
      const matchMin    = !minAmount || r.totalAmount >= Number(minAmount);
      const matchMax    = !maxAmount || r.totalAmount <= Number(maxAmount);
      return matchTab && matchPay && matchSearch && matchFrom && matchTo && matchMin && matchMax;
    })
    .sort((a, b) => {
      const dir = sort.dir === 'asc' ? 1 : -1;
      if (sort.field === 'startDate') return dir * a.startDate.localeCompare(b.startDate);
      if (sort.field === 'totalAmount') return dir * (a.totalAmount - b.totalAmount);
      if (sort.field === 'status') return dir * a.status.localeCompare(b.status);
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (field: SortField) => {
    setSort(s => s.field === field ? { field, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { field, dir: 'asc' });
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
    borderRadius: 16, boxShadow: 'var(--shadow)', overflow: 'hidden',
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
      {detailRow && (
        <DetailModal
          row={detailRow}
          onClose={() => setDetailRow(null)}
          onConfirm={() => handleConfirm(detailRow)}
          confirming={confirmAction.isLoading}
        />
      )}

      {createOpen && (
        <CreateReservationModal onClose={() => setCreateOpen(false)} onCreated={refetch} />
      )}

      {cancelTarget && (
        <ConfirmDialog
          title="Cancel reservation"
          message={`Cancel reservation #${cancelTarget.id.toUpperCase().slice(0, 6)} for ${cancelTarget.customer?.firstName} ${cancelTarget.customer?.lastName}? This cannot be undone.`}
          confirmLabel="Cancel reservation"
          danger
          isLoading={cancelAction.isLoading}
          onConfirm={handleCancel}
          onCancel={() => setCancelTarget(null)}
        />
      )}

      {refundTarget && (
        <ConfirmDialog
          title="Refund reservation"
          message={`Issue a refund of €${refundTarget.totalAmount} for reservation #${refundTarget.id.toUpperCase().slice(0, 6)}? This action will trigger a payment refund.`}
          confirmLabel="Issue refund"
          isLoading={refundAction.isLoading}
          onConfirm={handleRefund}
          onCancel={() => setRefundTarget(null)}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "'Cormorant Garamond',serif", fontSize: 30, fontWeight: 600, letterSpacing: '.01em', lineHeight: 1.05, color: 'var(--ink)' }}>Reservations</h1>
          <p style={{ margin: '5px 0 0', fontSize: 13.5, color: 'var(--muted)' }}>
            {isLoading ? (
              <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 12, color: 'var(--faint)' }}>Loading…</span>
            ) : (
              <>
                {allRows.length} bookings ·{' '}
                <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 12, color: 'var(--brand)' }}>
                  {pendingCount} pending action
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
            {activeFilterCount > 0 && (
              <span style={{ background: 'var(--brand)', color: '#fff', borderRadius: 999, width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontFamily: "'Geist Mono',monospace" }}>{activeFilterCount}</span>
            )}
          </Button>
          <Button size="md" onClick={() => setCreateOpen(true)}>
            <Plus size={15} strokeWidth={1.6} />New reservation
          </Button>
        </div>
      </div>

      {/* Filters panel */}
      {filtersOpen && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Payment</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {PAY_FILTERS.map(f => (
                  <button key={f.key} onClick={() => { setPayFilter(f.key); setPage(1); }} style={chipBtn(payFilter === f.key, f.color)}>{f.label}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Start date</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} style={{ height: 32, padding: '0 8px', borderRadius: 7, fontSize: 12, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--ink)', outline: 'none' }} />
                <span style={{ fontSize: 12, color: 'var(--faint)' }}>→</span>
                <input type="date" value={dateTo} min={dateFrom || undefined} onChange={e => { setDateTo(e.target.value); setPage(1); }} style={{ height: 32, padding: '0 8px', borderRadius: 7, fontSize: 12, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--ink)', outline: 'none' }} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Amount (€)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="number" min={0} placeholder="Min" value={minAmount} onChange={e => { setMinAmount(e.target.value); setPage(1); }} style={{ height: 32, width: 80, padding: '0 8px', borderRadius: 7, fontSize: 12, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--ink)', outline: 'none' }} />
                <span style={{ fontSize: 12, color: 'var(--faint)' }}>–</span>
                <input type="number" min={0} placeholder="Max" value={maxAmount} onChange={e => { setMaxAmount(e.target.value); setPage(1); }} style={{ height: 32, width: 80, padding: '0 8px', borderRadius: 7, fontSize: 12, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--ink)', outline: 'none' }} />
              </div>
            </div>
          </div>
          {activeFilterCount > 0 && (
            <button onClick={() => { setPayFilter('all'); setDateFrom(''); setDateTo(''); setMinAmount(''); setMaxAmount(''); setPage(1); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--faint)', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>
              <X size={13} />Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Status tabs + Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 3, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 4 }}>
          {STATUS_TABS.map(t => (
            <button key={t.key} onClick={() => { setTabFilter(t.key); setPage(1); }} style={{ fontSize: 12.5, fontWeight: 500, padding: '6px 11px', borderRadius: 7, border: 'none', cursor: 'pointer', background: tabFilter === t.key ? 'var(--ink)' : 'transparent', color: tabFilter === t.key ? 'var(--bg)' : 'var(--muted)' }}>
              {t.label}{' '}
              <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 10, opacity: 0.65 }}>{tabCounts[t.key] ?? 0}</span>
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 36, padding: '0 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--faint)', minWidth: 280 }}>
            <Search size={14} strokeWidth={1.6} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by customer, bike, ID…" style={{ fontSize: 13, background: 'transparent', border: 'none', outline: 'none', color: 'var(--ink)', width: '100%' }} />
            {search && (
              <button onClick={() => { setSearch(''); setPage(1); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--faint)', display: 'flex' }}><X size={13} /></button>
            )}
          </div>
        </div>
      </div>

      <div style={card}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '90px 1.4fr 1.2fr 1fr 80px 100px 90px 60px', gap: 12, alignItems: 'center', padding: '11px 20px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border-2)' }}>
          <span style={{ ...colBtn, cursor: 'default' }}>ID</span>
          <span style={{ ...colBtn, cursor: 'default' }}>Customer</span>
          <span style={{ ...colBtn, cursor: 'default' }}>Motorcycle</span>
          <button style={colBtn} onClick={() => toggleSort('startDate')}>Dates <SortIcon field="startDate" /></button>
          <button style={colBtn} onClick={() => toggleSort('totalAmount')}>Amount <SortIcon field="totalAmount" /></button>
          <button style={colBtn} onClick={() => toggleSort('status')}>Status <SortIcon field="status" /></button>
          <span style={{ ...colBtn, cursor: 'default' }}>Payment</span>
          <span />
        </div>

        {isLoading ? (
          <TableSkeleton gridTemplateColumns="90px 1.4fr 1.2fr 1fr 80px 100px 90px 60px" columns={8} />
        ) : fetchError ? (
          <ErrorState message="Impossible de charger les réservations." onRetry={refetch} />
        ) : paginated.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--faint)', fontSize: 13 }}>No reservations found.</div>
        ) : (
          paginated.map((r) => (
            <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '90px 1.4fr 1.2fr 1fr 80px 100px 90px 60px', gap: 12, alignItems: 'center', padding: '12px 20px', borderTop: '1px solid var(--border-2)', fontSize: 12.5 }}>
              <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 10.5, color: 'var(--faint)' }}>#{r.id.toUpperCase().slice(0, 6)}</span>
              <div>
                <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{r.customer?.firstName} {r.customer?.lastName}</div>
                <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: 10.5, color: 'var(--faint)' }}>{r.customer?.phone}</div>
              </div>
              <div>
                <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{r.moto?.brand}</div>
                <div style={{ fontSize: 11, color: 'var(--faint)' }}>{r.moto?.model}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--ink)' }}>{format(parseISO(r.startDate), 'dd MMM', { locale: fr })}</div>
                <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: 10.5, color: 'var(--faint)' }}>→ {format(parseISO(r.endDate), 'dd MMM yyyy', { locale: fr })}</div>
              </div>
              <span style={{ fontFamily: "'Geist Mono',monospace", fontWeight: 500, color: 'var(--ink)' }}>{r.totalAmount} €</span>
              <Pill config={resCfg[r.status]} />
              <Pill config={payCfg[r.paymentStatus]} />
              <RowActions
                status={r.status}
                onView={() => setDetailRow(r)}
                onConfirm={() => handleConfirm(r)}
                onCancel={() => setCancelTarget(r)}
                onRefund={() => setRefundTarget(r)}
              />
            </div>
          ))
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: '1px solid var(--border-2)', background: 'var(--surface-2)' }}>
            <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 11, color: 'var(--faint)' }}>
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
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
