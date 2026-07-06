import { useState, useRef, useEffect } from 'react';
import { Download, Search, X, Ellipsis, SlidersHorizontal, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { ConfirmDialog } from '@/core/components/ui/ConfirmDialog';

const PAYMENTS_MOCK = [
  { id: 'p1', ref: 'RZ-4821', customer: 'Lucas Bernard', amount: 420, deposit: 1500, method: 'Card',    date: '2026-06-18', status: 'paid'    },
  { id: 'p2', ref: 'RZ-4820', customer: 'Sofia Rossi',   amount: 615, deposit: 2000, method: 'Card',    date: '2026-06-20', status: 'paid'    },
  { id: 'p3', ref: 'RZ-4818', customer: 'Marco Conti',   amount: 380, deposit: 1500, method: 'Card',    date: '2026-06-19', status: 'paid'    },
  { id: 'p4', ref: 'RZ-4815', customer: 'Emma Laurent',  amount: 190, deposit: 800,  method: 'Transfer', date: '2026-06-14', status: 'paid'    },
  { id: 'p5', ref: 'RZ-4811', customer: 'Tom Dubois',    amount: 540, deposit: 2000, method: 'Card',    date: '2026-06-11', status: 'pending' },
  { id: 'p6', ref: 'RZ-4799', customer: 'Ana Ferreira',  amount: 320, deposit: 1000, method: 'Card',    date: '2026-06-08', status: 'paid'    },
  { id: 'p7', ref: 'RZ-4782', customer: 'Luca Romano',   amount: 260, deposit: 1000, method: 'Transfer', date: '2026-06-04', status: 'refunded'},
];

type PayStatus = 'paid' | 'pending' | 'refunded' | 'failed';
type PayStatusFilter = PayStatus | 'all';
type SortField = 'date' | 'amount' | 'customer' | 'status';
type SortDir = 'asc' | 'desc';

const STATUS_ORDER: Record<PayStatus, number> = { paid: 0, pending: 1, refunded: 2, failed: 3 };

const statusCfg: Record<PayStatus, { label: string; color: string; bg: string }> = {
  paid:     { label: 'Paid',     color: 'var(--cmy-green)', bg: 'color-mix(in srgb,var(--cmy-green) 13%,transparent)' },
  pending:  { label: 'Pending',  color: 'var(--cmy-amber)', bg: 'color-mix(in srgb,var(--cmy-amber) 15%,transparent)' },
  refunded: { label: 'Refunded', color: 'var(--faint)',     bg: 'color-mix(in srgb,var(--faint) 16%,transparent)' },
  failed:   { label: 'Failed',   color: 'var(--cmy-red)',   bg: 'color-mix(in srgb,var(--cmy-red) 14%,transparent)' },
};

function Pill({ status }: { status: PayStatus }) {
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

type Payment = typeof PAYMENTS_MOCK[number];

const STATUS_FILTER_OPTIONS: { key: PayStatusFilter; label: string; color?: string }[] = [
  { key: 'all',      label: 'All'      },
  { key: 'paid',     label: 'Paid',     color: 'var(--cmy-green)' },
  { key: 'pending',  label: 'Pending',  color: 'var(--cmy-amber)' },
  { key: 'refunded', label: 'Refunded'                             },
  { key: 'failed',   label: 'Failed',   color: 'var(--cmy-red)'   },
];

/* ── Row actions ── */
function RowActions({ onClose, onRefund }: { onClose: () => void; onRefund: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  return (
    <div ref={ref} style={{
      position: 'absolute', right: 0, top: 32,
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 10, boxShadow: 'var(--shadow)',
      minWidth: 160, padding: 5, zIndex: 50,
    }}>
      {['View receipt', 'Download invoice'].map(label => (
        <button key={label} onClick={onClose} style={{
          display: 'block', width: '100%', padding: '7px 10px',
          textAlign: 'left', fontSize: 12.5, color: 'var(--ink)',
          border: 'none', background: 'transparent', borderRadius: 7, cursor: 'pointer',
        }}>{label}</button>
      ))}
      <div style={{ borderTop: '1px solid var(--border-2)', marginTop: 4, paddingTop: 4 }}>
        <button onClick={() => { onClose(); onRefund(); }} style={{
          display: 'block', width: '100%', padding: '7px 10px',
          textAlign: 'left', fontSize: 12.5, color: 'var(--cmy-amber)',
          border: 'none', background: 'transparent', borderRadius: 7, cursor: 'pointer',
        }}>Refund</button>
      </div>
    </div>
  );
}

/* ── Client-side CSV export ── */
function exportCSV(data: typeof PAYMENTS_MOCK) {
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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PayStatusFilter>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [refundTarget, setRefundTarget] = useState<Payment | null>(null);
  const [sort, setSort] = useState<{ field: SortField; dir: SortDir }>({ field: 'date', dir: 'desc' });

  const filtered = PAYMENTS_MOCK.filter(p => {
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
    if (sort.field === 'status')   return d * (STATUS_ORDER[a.status as PayStatus] - STATUS_ORDER[b.status as PayStatus]);
    return 0;
  });

  const total = sorted.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const activeFilterCount = statusFilter !== 'all' ? 1 : 0;

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
      {refundTarget && (
        <ConfirmDialog
          title="Issue refund"
          message={`Refund €${refundTarget.amount} to ${refundTarget.customer} for booking #${refundTarget.ref}? This will initiate a payment reversal.`}
          confirmLabel="Issue refund"
          onConfirm={() => {
            // TODO: POST /api/payments/:id/refund
            setRefundTarget(null);
          }}
          onCancel={() => setRefundTarget(null)}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "'Cormorant Garamond',serif", fontSize: 30, fontWeight: 600, letterSpacing: '.01em', lineHeight: 1.05, color: 'var(--ink)' }}>Payments</h1>
          <p style={{ margin: '5px 0 0', fontSize: 13.5, color: 'var(--muted)' }}>
            Transaction history &amp; deposits
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
          {/* Client-side CSV export on filtered data */}
          <button
            onClick={() => exportCSV(sorted)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7, height: 36, padding: '0 14px',
              border: '1px solid var(--border)', background: 'var(--surface)',
              borderRadius: 10, fontSize: 13, fontWeight: 500, color: 'var(--ink)', cursor: 'pointer',
            }}
          >
            <Download size={15} strokeWidth={1.6} />Export CSV
          </button>
        </div>
      </div>

      {/* Summary cards — calculated from filtered data */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 16 }}>
        {[
          { label: 'Collected MTD',  value: `€${total.toLocaleString()}`,                                                                                        sub: 'gross rental income',    color: 'var(--ink)'       },
          { label: 'Deposits held',  value: `€${PAYMENTS_MOCK.reduce((s,p)=>s+p.deposit,0).toLocaleString()}`,                                                   sub: 'across active bookings', color: 'var(--ink)'       },
          { label: 'Pending',        value: `€${sorted.filter(p=>p.status==='pending').reduce((s,p)=>s+p.amount,0)}`,                                            sub: `${sorted.filter(p=>p.status==='pending').length} awaiting payment`, color: 'var(--cmy-amber)' },
        ].map(s => (
          <div key={s.label} style={{ ...card, padding: '17px 18px' }}>
            <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--faint)' }}>{s.label}</div>
            <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: 26, fontWeight: 500, letterSpacing: '-.02em', color: s.color, marginTop: 10 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters panel */}
      {filtersOpen && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '16px 18px', marginBottom: 14,
          display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Status</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {STATUS_FILTER_OPTIONS.map(f => (
                <button key={f.key} onClick={() => setStatusFilter(f.key)} style={chipBtn(statusFilter === f.key, f.color)}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          {statusFilter !== 'all' && (
            <button onClick={() => setStatusFilter('all')} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 12, color: 'var(--faint)', border: 'none',
              background: 'transparent', cursor: 'pointer',
            }}>
              <X size={13} />Clear filters
            </button>
          )}
        </div>
      )}

      {/* Search + table */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, height: 36, padding: '0 12px',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 10, color: 'var(--faint)', minWidth: 240,
        }}>
          <Search size={14} strokeWidth={1.6} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by booking or customer…"
            style={{ fontSize: 13, background: 'transparent', border: 'none', outline: 'none', color: 'var(--ink)', width: '100%' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--faint)', display: 'flex' }}>
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '100px 1.4fr 1.2fr 90px 90px 90px 100px 44px',
          gap: 12, alignItems: 'center', padding: '11px 20px',
          background: 'var(--surface-2)',
          borderBottom: '1px solid var(--border-2)',
        }}>
          <button style={colBtn} onClick={() => toggleSort('date')}>
            Date <SortIcon field="date" />
          </button>
          <span style={{ ...colBtn, cursor: 'default' }}>Booking</span>
          <button style={colBtn} onClick={() => toggleSort('customer')}>
            Customer <SortIcon field="customer" />
          </button>
          <span style={{ ...colBtn, cursor: 'default' }}>Method</span>
          <button style={colBtn} onClick={() => toggleSort('amount')}>
            Amount <SortIcon field="amount" />
          </button>
          <span style={{ ...colBtn, cursor: 'default' }}>Deposit</span>
          <button style={colBtn} onClick={() => toggleSort('status')}>
            Status <SortIcon field="status" />
          </button>
          <span />
        </div>

        {sorted.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--faint)', fontSize: 13 }}>
            No payments found.
          </div>
        ) : (
          sorted.map(p => (
            <div key={p.id} style={{
              display: 'grid', gridTemplateColumns: '100px 1.4fr 1.2fr 90px 90px 90px 100px 44px',
              gap: 12, alignItems: 'center', padding: '12px 20px',
              borderTop: '1px solid var(--border-2)', fontSize: 12.5,
            }}>
              <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 11, color: 'var(--faint)' }}>{p.date}</span>
              <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 11, color: 'var(--muted)' }}>#{p.ref}</span>
              <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{p.customer}</span>
              <span style={{ color: 'var(--muted)' }}>{p.method}</span>
              <span style={{ fontFamily: "'Geist Mono',monospace", fontWeight: 500, color: 'var(--ink)' }}>€{p.amount}</span>
              <span style={{ fontFamily: "'Geist Mono',monospace", color: 'var(--faint)' }}>€{p.deposit}</span>
              <Pill status={p.status as PayStatus} />
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)}
                  aria-label="Payment actions"
                  style={{
                    width: 28, height: 28, border: 'none', background: 'transparent',
                    borderRadius: 7, color: 'var(--faint)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Ellipsis size={15} strokeWidth={1.6} />
                </button>
                {openMenuId === p.id && (
                  <RowActions
                    onClose={() => setOpenMenuId(null)}
                    onRefund={() => setRefundTarget(p)}
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
