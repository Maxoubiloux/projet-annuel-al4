import { Download } from 'lucide-react';

const PAYMENTS_MOCK = [
  { id: 'p1', ref: 'RZ-4821', customer: 'Lucas Bernard', amount: 420, deposit: 1500, method: 'Card',   date: '2026-06-18', status: 'paid'    },
  { id: 'p2', ref: 'RZ-4820', customer: 'Sofia Rossi',   amount: 615, deposit: 2000, method: 'Card',   date: '2026-06-20', status: 'paid'    },
  { id: 'p3', ref: 'RZ-4818', customer: 'Marco Conti',   amount: 380, deposit: 1500, method: 'Card',   date: '2026-06-19', status: 'paid'    },
  { id: 'p4', ref: 'RZ-4815', customer: 'Emma Laurent',  amount: 190, deposit: 800,  method: 'Transfer',date: '2026-06-14', status: 'paid'    },
  { id: 'p5', ref: 'RZ-4811', customer: 'Tom Dubois',    amount: 540, deposit: 2000, method: 'Card',   date: '2026-06-11', status: 'pending' },
  { id: 'p6', ref: 'RZ-4799', customer: 'Ana Ferreira',  amount: 320, deposit: 1000, method: 'Card',   date: '2026-06-08', status: 'paid'    },
  { id: 'p7', ref: 'RZ-4782', customer: 'Luca Romano',   amount: 260, deposit: 1000, method: 'Transfer',date: '2026-06-04', status: 'refunded'},
];

type PayStatus = 'paid' | 'pending' | 'refunded' | 'failed';
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

export function PaymentListPage() {
  const total = PAYMENTS_MOCK.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);

  const card: React.CSSProperties = {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 16, boxShadow: 'var(--shadow)',
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "'Cormorant Garamond',serif", fontSize: 30, fontWeight: 600, letterSpacing: '.01em', lineHeight: 1.05, color: 'var(--ink)' }}>Payments</h1>
          <p style={{ margin: '5px 0 0', fontSize: 13.5, color: 'var(--muted)' }}>
            Transaction history &amp; deposits
          </p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 7, height: 36, padding: '0 14px',
          border: '1px solid var(--border)', background: 'var(--surface)',
          borderRadius: 10, fontSize: 13, fontWeight: 500, color: 'var(--ink)', cursor: 'pointer',
        }}>
          <Download size={15} strokeWidth={1.6} />Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 16 }}>
        {[
          { label: 'Collected MTD',  value: `€${total.toLocaleString()}`, sub: 'gross rental income', color: 'var(--ink)' },
          { label: 'Deposits held',  value: `€${PAYMENTS_MOCK.reduce((s,p)=>s+p.deposit,0).toLocaleString()}`, sub: 'across active bookings', color: 'var(--ink)' },
          { label: 'Pending',        value: `€${PAYMENTS_MOCK.filter(p=>p.status==='pending').reduce((s,p)=>s+p.amount,0)}`, sub: '1 awaiting payment', color: 'var(--cmy-amber)' },
        ].map(s => (
          <div key={s.label} style={{ ...card, padding: '17px 18px' }}>
            <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--faint)' }}>{s.label}</div>
            <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: 26, fontWeight: 500, letterSpacing: '-.02em', color: s.color, marginTop: 10 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '100px 1.4fr 1.2fr 90px 90px 90px 100px',
          gap: 12, alignItems: 'center', padding: '11px 20px',
          fontFamily: "'Geist Mono',monospace", fontSize: 10,
          letterSpacing: '.08em', textTransform: 'uppercase',
          color: 'var(--faint)', background: 'var(--surface-2)',
          borderBottom: '1px solid var(--border-2)',
        }}>
          <span>Date</span>
          <span>Booking</span>
          <span>Customer</span>
          <span>Method</span>
          <span>Amount</span>
          <span>Deposit</span>
          <span>Status</span>
        </div>

        {PAYMENTS_MOCK.map(p => (
          <div key={p.id} style={{
            display: 'grid', gridTemplateColumns: '100px 1.4fr 1.2fr 90px 90px 90px 100px',
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
          </div>
        ))}
      </div>
    </div>
  );
}
