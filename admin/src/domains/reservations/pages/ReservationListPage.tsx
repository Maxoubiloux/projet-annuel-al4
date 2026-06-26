import { useState } from 'react';
import { Search, Plus, Filter, Eye, Ellipsis } from 'lucide-react';
import { RESERVATIONS_MOCK, CUSTOMERS_MOCK } from '@/mocks/reservations';
import { MOTOS_MOCK } from '@/mocks/motos';
import type { ReservationStatus, PaymentStatus } from '../types';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

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

export function ReservationListPage() {
  const [search, setSearch] = useState('');

  const rows = RESERVATIONS_MOCK.map(r => ({
    ...r,
    moto: MOTOS_MOCK.find(m => m.id === r.motoId),
    customer: CUSTOMERS_MOCK.find(c => c.id === r.customerId),
  })).filter(r =>
    !search ||
    r.id.includes(search) ||
    r.customer?.lastName.toLowerCase().includes(search.toLowerCase()) ||
    r.moto?.brand.toLowerCase().includes(search.toLowerCase())
  );

  const card: React.CSSProperties = {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 16, boxShadow: 'var(--shadow)', overflow: 'hidden',
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "'Cormorant Garamond',serif", fontSize: 30, fontWeight: 600, letterSpacing: '.01em', lineHeight: 1.05, color: 'var(--ink)' }}>Reservations</h1>
          <p style={{ margin: '5px 0 0', fontSize: 13.5, color: 'var(--muted)' }}>
            {rows.length} bookings · <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 12, color: 'var(--brand)' }}>12 pending action</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 7, height: 36, padding: '0 13px',
            border: '1px solid var(--border)', background: 'var(--surface)',
            borderRadius: 10, fontSize: 13, fontWeight: 500, color: 'var(--ink)', cursor: 'pointer',
          }}>
            <Filter size={15} strokeWidth={1.6} />Filters
          </button>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 7, height: 36, padding: '0 14px',
            background: 'var(--brand)', color: '#fff',
            border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>
            <Plus size={15} strokeWidth={1.6} />New reservation
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 14 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, height: 36, padding: '0 12px',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 10, color: 'var(--faint)', minWidth: 280,
        }}>
          <Search size={14} strokeWidth={1.6} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by customer, bike, ID…"
            style={{ fontSize: 13, background: 'transparent', border: 'none', outline: 'none', color: 'var(--ink)', width: '100%' }}
          />
        </div>
      </div>

      <div style={card}>
        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '90px 1.4fr 1.2fr 1fr 80px 100px 90px 60px',
          gap: 12, alignItems: 'center', padding: '11px 20px',
          fontFamily: "'Geist Mono',monospace", fontSize: 10,
          letterSpacing: '.08em', textTransform: 'uppercase',
          color: 'var(--faint)', background: 'var(--surface-2)',
          borderBottom: '1px solid var(--border-2)',
        }}>
          <span>ID</span>
          <span>Customer</span>
          <span>Motorcycle</span>
          <span>Dates</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Payment</span>
          <span />
        </div>

        {rows.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--faint)', fontSize: 13 }}>
            No reservations found.
          </div>
        ) : (
          rows.map((r) => (
            <div key={r.id} style={{
              display: 'grid',
              gridTemplateColumns: '90px 1.4fr 1.2fr 1fr 80px 100px 90px 60px',
              gap: 12, alignItems: 'center', padding: '12px 20px',
              borderTop: '1px solid var(--border-2)', fontSize: 12.5,
            }}>
              <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 10.5, color: 'var(--faint)' }}>
                #{r.id.toUpperCase().slice(0, 6)}
              </span>
              <div>
                <div style={{ fontWeight: 500, color: 'var(--ink)' }}>
                  {r.customer?.firstName} {r.customer?.lastName}
                </div>
                <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: 10.5, color: 'var(--faint)' }}>
                  {r.customer?.phone}
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{r.moto?.brand}</div>
                <div style={{ fontSize: 11, color: 'var(--faint)' }}>{r.moto?.model}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--ink)' }}>
                  {format(parseISO(r.startDate), 'dd MMM', { locale: fr })}
                </div>
                <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: 10.5, color: 'var(--faint)' }}>
                  → {format(parseISO(r.endDate), 'dd MMM yyyy', { locale: fr })}
                </div>
              </div>
              <span style={{ fontFamily: "'Geist Mono',monospace", fontWeight: 500, color: 'var(--ink)' }}>
                {r.totalAmount} €
              </span>
              <Pill config={resCfg[r.status]} />
              <Pill config={payCfg[r.paymentStatus]} />
              <div style={{ display: 'flex', gap: 4 }}>
                <button style={{ width: 26, height: 26, border: 'none', background: 'transparent', borderRadius: 6, color: 'var(--faint)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Eye size={13} strokeWidth={1.6} />
                </button>
                <button style={{ width: 26, height: 26, border: 'none', background: 'transparent', borderRadius: 6, color: 'var(--faint)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Ellipsis size={13} strokeWidth={1.6} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
