import { useState } from 'react';
import { Download, Search, X, Ellipsis, ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { ConfirmDialog } from '@/core/components/ui/ConfirmDialog';
import { Button } from '@/core/components/ui/Button';
import { DropdownMenu, DropdownMenuItem } from '@/core/components/ui/DropdownMenu';
import type { Payment, PaymentStatus } from '../types';
import { usePayments } from '../hooks/usePayments';
import { ReceiptModal, downloadReceipt } from '../components/ReceiptModal';
import { useToast } from '@/core/components/ToastProvider';
import { useAsync } from '@/core/hooks/useAsync';
import { api } from '@/core/services/api';
import { TableSkeleton, CardSkeleton } from '@/core/components/ui/Skeleton';
import { ErrorState } from '@/core/components/ui/ErrorState';

type PayStatusFilter = PaymentStatus | 'all';
type SortField = 'date' | 'amount' | 'customer' | 'status';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 10;

const STATUS_ORDER: Record<PaymentStatus, number> = { paid: 0, pending: 1, refunded: 2, failed: 3 };

const statusCfg: Record<PaymentStatus, { label: string; color: string; bg: string }> = {
  paid:     { label: 'Paid',     color: 'var(--cmy-green)', bg: 'color-mix(in srgb,var(--cmy-green) 13%,transparent)' },
  pending:  { label: 'Pending',  color: 'var(--cmy-amber)', bg: 'color-mix(in srgb,var(--cmy-amber) 15%,transparent)' },
  refunded: { label: 'Refunded', color: 'var(--faint)',     bg: 'color-mix(in srgb,var(--faint) 16%,transparent)' },
  failed:   { label: 'Failed',   color: 'var(--cmy-red)',   bg: 'color-mix(in srgb,var(--cmy-red) 14%,transparent)' },
};

function Pill({ status }: { status: PaymentStatus }) {
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

const STATUS_FILTER_OPTIONS: { key: PayStatusFilter; label: string; color?: string }[] = [
  { key: 'all',      label: 'All'      },
  { key: 'paid',     label: 'Paid',     color: 'var(--cmy-green)' },
  { key: 'pending',  label: 'Pending',  color: 'var(--cmy-amber)' },
  { key: 'refunded', label: 'Refunded'                             },
  { key: 'failed',   label: 'Failed',   color: 'var(--cmy-red)'   },
];

/* ── Row actions ── */
function RowActions({ anchorRect, onClose, onViewReceipt, onDownload, onRefund, canRefund }: {
  anchorRect: DOMRect;
  onClose: () => void;
  onViewReceipt: () => void;
  onDownload: () => void;
  onRefund: () => void;
  canRefund: boolean;
}) {
  return (
    <DropdownMenu anchorRect={anchorRect} onClose={onClose} minWidth={160}>
      <DropdownMenuItem onClick={() => { onClose(); onViewReceipt(); }}>View receipt</DropdownMenuItem>
      <DropdownMenuItem onClick={() => { onClose(); onDownload(); }}>Export receipt (.txt)</DropdownMenuItem>
      {canRefund && (
        <div style={{ borderTop: '1px solid var(--border-2)', marginTop: 4, paddingTop: 4 }}>
          <DropdownMenuItem color="var(--cmy-amber)" onClick={() => { onClose(); onRefund(); }}>Refund</DropdownMenuItem>
        </div>
      )}
    </DropdownMenu>
  );
}

function exportCSV(data: Payment[]) {
  const headers = ['Date', 'Booking', 'Customer', 'Method', 'Amount', 'Deposit', 'Status'];
  const rows = data.map(p => [p.date, `#${p.ref}`, p.customer, p.method, `€${p.amount}`, `€${p.deposit}`, p.status]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `payments-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function PaymentListPage() {
  const [page, setPage] = useState(1);
  const { data: payments, isLoading, error: fetchError, refetch } = usePayments({ page, limit: PAGE_SIZE });
  const { success, error } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PayStatusFilter>('all');
  const [openMenu, setOpenMenu] = useState<{ id: string; rect: DOMRect } | null>(null);
  const [refundTarget, setRefundTarget] = useState<Payment | null>(null);
  const [receiptTarget, setReceiptTarget] = useState<Payment | null>(null);
  const [sort, setSort] = useState<{ field: SortField; dir: SortDir }>({ field: 'date', dir: 'desc' });

  const refundAction = useAsync((id: string) => api.post(`/payments/${id}/refund`));

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

  const filtered = payments.filter(p => {
    const matchSearch = !search ||
      p.ref.toLowerCase().includes(search.toLowerCase()) ||
      p.customer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    const d = sort.dir === 'asc' ? 1 : -1;
    if (sort.field === 'date')     return d * a.date.localeCompare(b.date);
    if (sort.field === 'amount')   return d * (a.amount - b.amount);
    if (sort.field === 'customer') return d * a.customer.localeCompare(b.customer);
    if (sort.field === 'status')   return d * (STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
    return 0;
  });

  const collectedMTD = sorted.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const depositsHeld = payments.reduce((s, p) => s + p.deposit, 0);
  const pendingAmount = sorted.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  const pendingCount = sorted.filter(p => p.status === 'pending').length;

  const statusCounts = STATUS_FILTER_OPTIONS.reduce((acc, f) => {
    acc[f.key] = f.key === 'all' ? payments.length : payments.filter(p => p.status === f.key).length;
    return acc;
  }, {} as Record<PayStatusFilter, number>);

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

  return (
    <div>
      {refundTarget && (
        <ConfirmDialog
          title="Issue refund"
          message={`Refund €${refundTarget.amount} to ${refundTarget.customer} for booking #${refundTarget.ref}? This will initiate a payment reversal.`}
          confirmLabel="Issue refund"
          isLoading={refundAction.isLoading}
          onConfirm={handleRefund}
          onCancel={() => setRefundTarget(null)}
        />
      )}

      {receiptTarget && (
        <ReceiptModal payment={receiptTarget} onClose={() => setReceiptTarget(null)} />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "'Cormorant Garamond',serif", fontSize: 30, fontWeight: 600, letterSpacing: '.01em', lineHeight: 1.05, color: 'var(--ink)' }}>Payments</h1>
          <p style={{ margin: '5px 0 0', fontSize: 13.5, color: 'var(--muted)' }}>Transaction history &amp; deposits</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="outline" size="md" onClick={() => exportCSV(sorted)}>
            <Download size={15} strokeWidth={1.6} />Export CSV
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 16 }}>
        {isLoading ? (
          <>
            <CardSkeleton /><CardSkeleton /><CardSkeleton />
          </>
        ) : (
          [
            { label: 'Collected MTD',  value: `€${collectedMTD.toLocaleString()}`,   sub: 'gross rental income',    color: 'var(--ink)'       },
            { label: 'Deposits held',  value: `€${depositsHeld.toLocaleString()}`,    sub: 'across active bookings', color: 'var(--ink)'       },
            { label: 'Pending',        value: `€${pendingAmount}`,                    sub: `${pendingCount} awaiting payment`, color: 'var(--cmy-amber)' },
          ].map(s => (
            <div key={s.label} style={{ ...card, padding: '17px 18px' }}>
              <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--faint)' }}>{s.label}</div>
              <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: 26, fontWeight: 500, letterSpacing: '-.02em', color: s.color, marginTop: 10 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 4 }}>{s.sub}</div>
            </div>
          ))
        )}
      </div>

      {/* Status tabs + Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 3, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 4 }}>
          {STATUS_FILTER_OPTIONS.map(f => (
            <button key={f.key} onClick={() => { setStatusFilter(f.key); setPage(1); }} style={{ fontSize: 12.5, fontWeight: 500, padding: '6px 11px', borderRadius: 7, border: 'none', cursor: 'pointer', background: statusFilter === f.key ? 'var(--ink)' : 'transparent', color: statusFilter === f.key ? 'var(--bg)' : 'var(--muted)' }}>
              {f.label}{' '}
              <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 10, opacity: 0.65 }}>{statusCounts[f.key] ?? 0}</span>
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 36, padding: '0 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--faint)', minWidth: 240 }}>
            <Search size={14} strokeWidth={1.6} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by booking or customer…" style={{ fontSize: 13, background: 'transparent', border: 'none', outline: 'none', color: 'var(--ink)', width: '100%' }} />
            {search && (
              <button onClick={() => { setSearch(''); setPage(1); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--faint)', display: 'flex' }}><X size={13} /></button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '100px 1.4fr 1.2fr 90px 90px 90px 100px 44px', gap: 12, alignItems: 'center', padding: '11px 20px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border-2)' }}>
          <button style={colBtn} onClick={() => toggleSort('date')}>Date <SortIcon field="date" /></button>
          <span style={{ ...colBtn, cursor: 'default' }}>Booking</span>
          <button style={colBtn} onClick={() => toggleSort('customer')}>Customer <SortIcon field="customer" /></button>
          <span style={{ ...colBtn, cursor: 'default' }}>Method</span>
          <button style={colBtn} onClick={() => toggleSort('amount')}>Amount <SortIcon field="amount" /></button>
          <span style={{ ...colBtn, cursor: 'default' }}>Deposit</span>
          <button style={colBtn} onClick={() => toggleSort('status')}>Status <SortIcon field="status" /></button>
          <span />
        </div>

        {isLoading ? (
          <TableSkeleton gridTemplateColumns="100px 1.4fr 1.2fr 90px 90px 90px 100px 44px" columns={8} />
        ) : fetchError ? (
          <ErrorState message="Impossible de charger les paiements." onRetry={refetch} />
        ) : paginated.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--faint)', fontSize: 13 }}>No payments found.</div>
        ) : (
          paginated.map(p => (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '100px 1.4fr 1.2fr 90px 90px 90px 100px 44px', gap: 12, alignItems: 'center', padding: '12px 20px', borderTop: '1px solid var(--border-2)', fontSize: 12.5 }}>
              <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 11, color: 'var(--faint)' }}>{p.date.slice(0, 10)}</span>
              <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 11, color: 'var(--muted)' }}>#{p.ref}</span>
              <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{p.customer}</span>
              <span style={{ color: 'var(--muted)' }}>{p.method}</span>
              <span style={{ fontFamily: "'Geist Mono',monospace", fontWeight: 500, color: 'var(--ink)' }}>€{p.amount}</span>
              <span style={{ fontFamily: "'Geist Mono',monospace", color: 'var(--faint)' }}>€{p.deposit}</span>
              <Pill status={p.status} />
              <div style={{ position: 'relative' }}>
                <button onClick={(e) => setOpenMenu(openMenu?.id === p.id ? null : { id: p.id, rect: e.currentTarget.getBoundingClientRect() })} aria-label="Payment actions" style={{ width: 28, height: 28, border: 'none', background: 'transparent', borderRadius: 7, color: 'var(--faint)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Ellipsis size={15} strokeWidth={1.6} />
                </button>
                {openMenu?.id === p.id && (
                  <RowActions
                    anchorRect={openMenu.rect}
                    onClose={() => setOpenMenu(null)}
                    onViewReceipt={() => setReceiptTarget(p)}
                    onDownload={() => downloadReceipt(p)}
                    onRefund={() => setRefundTarget(p)}
                    canRefund={p.status === 'paid'}
                  />
                )}
              </div>
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
