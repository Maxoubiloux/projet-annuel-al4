import { useState } from 'react';
import {
  LayoutGrid, LayoutPanelLeft, Download,
  TrendingUp, TrendingDown, ArrowRight,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { useAuth } from '@/core/auth/AuthContext';

/* ── data ─────────────────────────────────────────────────── */
const revenueData = [
  { m: 'Jul', v: 48 }, { m: 'Aug', v: 52 }, { m: 'Sep', v: 45 },
  { m: 'Oct', v: 50 }, { m: 'Nov', v: 42 }, { m: 'Dec', v: 55 },
  { m: 'Jan', v: 58 }, { m: 'Feb', v: 62 }, { m: 'Mar', v: 68 },
  { m: 'Apr', v: 72 }, { m: 'May', v: 82 }, { m: 'Jun', v: 90 },
];

const barsData = [22,19,28,31,25,24,30,33,27,29,26,34,31,28].map((v, i) => ({ i, v }));

const reservations = [
  { id: '#RZ-4821', customer: 'Lucas Bernard', moto: 'Ducati Monster',       period: '18–22 Jun', days: 4, amount: '€420', status: 'active'  },
  { id: '#RZ-4820', customer: 'Sofia Rossi',   moto: 'BMW R nineT',          period: '20–27 Jun', days: 7, amount: '€615', status: 'pending' },
  { id: '#RZ-4818', customer: 'Marco Conti',   moto: 'Triumph Bonneville',   period: '19–21 Jun', days: 2, amount: '€380', status: 'active'  },
  { id: '#RZ-4815', customer: 'Emma Laurent',  moto: 'Vespa GTS 300',        period: '14–15 Jun', days: 1, amount: '€190', status: 'done'    },
  { id: '#RZ-4811', customer: 'Tom Dubois',    moto: 'Harley Iron 883',      period: '11–16 Jun', days: 5, amount: '€540', status: 'overdue' },
];

const alerts = [
  { sev: 'critical', title: 'Brake service overdue', moto: 'Kawasaki Z900',     id: 'CMY-072', km: '18,400 km', due: '23 Jun' },
  { sev: 'warning',  title: 'Oil change due',         moto: 'Ducati Monster',   id: 'CMY-038', km: '12,050 km', due: '28 Jun' },
  { sev: 'warning',  title: 'Tire wear inspection',   moto: 'BMW R nineT',      id: 'CMY-119', km: '9,800 km',  due: '30 Jun' },
  { sev: 'ok',       title: 'Chain lubrication',      moto: 'Triumph Street',   id: 'CMY-051', km: '15,600 km', due: '04 Jul' },
];

const yardTiles = (() => {
  const seed = [0,1,0,0,0,1,2,0,0,0,1,1,0,0,0,1,0,2,0,0,0,1,0,0,0,3,0,1,0,0,0,0,1,0,0,0,1,2,0,0,0,0,1,0,0,0,1,0,2,0,0,0,1,0,0,0];
  return seed.map(v => ['green','brand','amber','faint'][v]);
})();

const occupancy = [
  { name: 'Ducati Monster',   l: '4%',  w: '48%', c: 'var(--brand)' },
  { name: 'BMW R nineT',      l: '22%', w: '64%', c: 'var(--brand)' },
  { name: 'Triumph Bonn.',    l: '0%',  w: '30%', c: 'var(--brand)', r: { l: '58%', w: '34%' } },
  { name: 'Vespa GTS 300',    l: '12%', w: '20%', c: 'var(--cmy-amber)' },
  { name: 'Harley Iron 883',  l: '30%', w: '58%', c: 'var(--brand)' },
  { name: 'Kawasaki Z900',    l: '0%',  w: '100%', c: 'var(--cmy-amber)', dashed: true, dim: 0.35 },
];

/* ── sub-components ───────────────────────────────────────── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const W = 120, H = 40;
  const min = Math.min(...data), rng = Math.max(...data) - min || 1;
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * W},${H - ((v - min) / rng) * H * 0.85 - H * 0.075}`
  ).join('L');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
      style={{ width: '100%', height: 28, marginTop: 10, overflow: 'visible' }}>
      <path d={`M${pts}`} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </svg>
  );
}

type StatusKey = 'active' | 'pending' | 'done' | 'overdue';
const statusCfg: Record<StatusKey, { label: string; color: string; bg: string }> = {
  active:  { label: 'Active',  color: 'var(--cmy-green)', bg: 'color-mix(in srgb,var(--cmy-green) 13%,transparent)' },
  pending: { label: 'Pending', color: 'var(--cmy-amber)', bg: 'color-mix(in srgb,var(--cmy-amber) 15%,transparent)' },
  done:    { label: 'Done',    color: 'var(--faint)',     bg: 'color-mix(in srgb,var(--faint) 16%,transparent)' },
  overdue: { label: 'Overdue', color: 'var(--cmy-red)',   bg: 'color-mix(in srgb,var(--cmy-red) 14%,transparent)' },
};
function Pill({ status }: { status: string }) {
  const c = statusCfg[status as StatusKey] ?? statusCfg.done;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontFamily: "'Geist Mono',monospace", fontSize: 10,
      textTransform: 'uppercase', letterSpacing: '.04em',
      padding: '4px 8px', borderRadius: 999,
      color: c.color, background: c.bg,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: 999, background: c.color }} />
      {c.label}
    </span>
  );
}

/* ── main component ───────────────────────────────────────── */
export function DashboardPage() {
  const [pane, setPane] = useState<'A' | 'B'>('A');
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'Adèle';

  const card: React.CSSProperties = {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 16, boxShadow: 'var(--shadow)',
  };

  const kpis = [
    {
      label: 'Fleet utilization', value: '87.4%',
      Icon: TrendingUp, delta: '+4.2', deltaColor: 'var(--cmy-green)',
      vs: 'vs 83.2%', sparkData: [60,65,70,68,72,75,78,74,80,82,85,87.4],
      sparkColor: 'var(--brand)', footL: '142 / 163 on road', footR: 'target 85%', footRColor: 'var(--faint)',
    },
    {
      label: 'Active rentals', value: '142',
      Icon: TrendingUp, delta: '+12', deltaColor: 'var(--cmy-green)',
      vs: 'vs 130', sparkData: [100,108,112,115,118,122,125,128,130,132,138,142],
      sparkColor: 'var(--brand)', footL: '38 due back today', footR: '6 overdue', footRColor: 'var(--cmy-red)',
    },
    {
      label: 'Revenue · MTD', value: '€90.2k',
      Icon: TrendingUp, delta: '+9.8%', deltaColor: 'var(--cmy-green)',
      vs: 'vs €82.1k', sparkData: [55,62,65,60,68,72,75,78,80,83,85,90.2],
      sparkColor: 'var(--brand)', footL: '€3.0k/day avg', footR: 'fcst €112k', footRColor: 'var(--faint)',
    },
    {
      label: 'Maintenance due', value: '7',
      Icon: TrendingDown, delta: '−2', deltaColor: 'var(--cmy-green)',
      vs: 'vs 9', sparkData: [12,11,10,11,9,10,9,8,9,7,8,7],
      sparkColor: 'var(--cmy-amber)', footL: '2 critical', footLColor: 'var(--cmy-red)', footR: '5 scheduled', footRColor: 'var(--faint)',
    },
  ] as const;

  return (
    <div>
      {/* ── page header ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-end',
        justifyContent: 'space-between', gap: 16,
        flexWrap: 'wrap', marginBottom: 22,
      }}>
        <div>
          <h1 style={{
            margin: 0, fontFamily: "'Cormorant Garamond',serif",
            fontSize: 30, fontWeight: 600, letterSpacing: '.01em',
            lineHeight: 1.05, color: 'var(--ink)',
          }}>Good morning, {firstName}</h1>
          <p style={{ margin: '5px 0 0', fontSize: 13.5, color: 'var(--muted)' }}>
            Here's how the yard is running —{' '}
            <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 12 }}>Sat, 21 Jun 2026</span>
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Pane toggle */}
          <div style={{
            display: 'flex', background: 'var(--surface)',
            border: '1px solid var(--border)', borderRadius: 10, padding: 3,
          }}>
            {(['A','B'] as const).map(p => (
              <button key={p} onClick={() => setPane(p)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 12.5, fontWeight: 500,
                padding: '6px 12px', border: 'none',
                background: pane === p ? 'var(--ink)' : 'transparent',
                color: pane === p ? 'var(--bg)' : 'var(--muted)',
                borderRadius: 7, cursor: 'pointer',
              }}>
                {p === 'A' ? <LayoutGrid size={12} /> : <LayoutPanelLeft size={12} />}
                {p === 'A' ? 'Operations' : 'Yard view'}
              </button>
            ))}
          </div>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 7,
            height: 36, padding: '0 14px',
            background: 'var(--brand)', color: '#fff',
            border: 'none', borderRadius: 10,
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>
            <Download size={14} strokeWidth={1.6} />Export
          </button>
        </div>
      </div>

      {/* ══════════════ PANE A: OPERATIONS ══════════════ */}
      {pane === 'A' && (
        <div>
          {/* KPI cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 16 }}>
            {kpis.map((k, i) => (
              <div key={i} style={{ ...card, padding: '17px 18px' }}>
                <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--faint)' }}>
                  {k.label}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 12 }}>
                  <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 29, fontWeight: 500, letterSpacing: '-.02em', color: 'var(--ink)' }}>
                    {k.value}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11.5, fontWeight: 500, color: k.deltaColor }}>
                    <k.Icon size={11} />{k.delta}
                  </span>
                  <span style={{ marginLeft: 'auto', fontFamily: "'Geist Mono',monospace", fontSize: 10.5, color: 'var(--faint)' }}>
                    {k.vs}
                  </span>
                </div>
                <Sparkline data={[...k.sparkData]} color={k.sparkColor} />
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginTop: 11, paddingTop: 10, borderTop: '1px solid var(--border-2)',
                  fontFamily: "'Geist Mono',monospace", fontSize: 10.5,
                }}>
                  <span style={{ color: ('footLColor' in k ? k.footLColor : 'var(--muted)') as string }}>{k.footL}</span>
                  <span style={{ color: k.footRColor }}>{k.footR}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Revenue chart + Fleet donut */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.95fr 1fr', gap: 16, marginBottom: 16 }}>
            <div style={{ ...card, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Revenue</div>
                  <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 2 }}>Gross rental income, last 12 months</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, margin: '14px 0 8px' }}>
                <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 25, fontWeight: 500, letterSpacing: '-.02em', color: 'var(--ink)' }}>€90.2k</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11.5, color: 'var(--cmy-green)' }}>
                  <TrendingUp size={11} />9.8% vs May
                </span>
                <span style={{ marginLeft: 'auto', fontFamily: "'Geist Mono',monospace", fontSize: 10.5, color: 'var(--faint)' }}>
                  12-mo total <span style={{ color: 'var(--muted)' }}>€782k</span>
                </span>
              </div>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7E2E32" stopOpacity={0.22} />
                        <stop offset="100%" stopColor="#7E2E32" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="m" stroke="var(--faint)" fontSize={10} tickLine={false} axisLine={false}
                      style={{ fontFamily: "'Geist Mono',monospace" }} />
                    <YAxis stroke="var(--faint)" fontSize={9} tickLine={false} axisLine={false}
                      tickFormatter={(v: number) => `€${v}k`} style={{ fontFamily: "'Geist Mono',monospace" }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8, border: '1px solid var(--border)',
                        background: 'var(--surface)', color: 'var(--ink)',
                        fontSize: 12, fontFamily: "'Geist Mono',monospace",
                        boxShadow: 'var(--shadow)',
                      }}
                      formatter={(v) => [`€${v}k`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="v" stroke="var(--brand)" strokeWidth={2.4}
                      fill="url(#revGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Fleet status donut */}
            <div style={{ ...card, padding: 20, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Fleet status</div>
              <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 2 }}>163 motorcycles</div>
              <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
                <div style={{
                  position: 'relative', width: 150, height: 150, borderRadius: 999,
                  background: 'conic-gradient(var(--cmy-green) 0 57%,var(--brand) 57% 84%,var(--cmy-amber) 84% 93%,var(--faint) 93% 100%)',
                }}>
                  <div style={{
                    position: 'absolute', inset: 19, borderRadius: 999,
                    background: 'var(--surface)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: 24, fontWeight: 500, lineHeight: 1, color: 'var(--ink)' }}>93</div>
                    <div style={{ fontSize: 10.5, color: 'var(--faint)' }}>available</div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {[
                  { dot: 'var(--cmy-green)', label: 'Available',   n: '93',  pct: '57%' },
                  { dot: 'var(--brand)',     label: 'On rent',     n: '44',  pct: '27%' },
                  { dot: 'var(--cmy-amber)', label: 'Maintenance', n: '15',  pct: '9%'  },
                  { dot: 'var(--faint)',     label: 'Reserved',    n: '11',  pct: '7%'  },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5, color: 'var(--ink)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: 3, background: item.dot, flexShrink: 0 }} />
                    {item.label}
                    <span style={{ marginLeft: 'auto', fontFamily: "'Geist Mono',monospace", color: 'var(--muted)' }}>
                      {item.n}<span style={{ color: 'var(--faint)' }}> · {item.pct}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reservations table + Maintenance alerts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
            <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '17px 20px 13px' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Recent reservations</div>
                <a href="/reservations" style={{ fontSize: 12, color: 'var(--brand)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                  View all <ArrowRight size={12} />
                </a>
              </div>
              <div style={{
                display: 'grid', gridTemplateColumns: '1.15fr 1fr 0.95fr 74px 84px',
                gap: 12, padding: '0 20px 8px',
                fontFamily: "'Geist Mono',monospace", fontSize: 10,
                letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--faint)',
                borderBottom: '1px solid var(--border-2)',
              }}>
                <span>Customer</span><span>Motorcycle</span><span>Period</span><span>Amount</span><span>Status</span>
              </div>
              {reservations.map((r, i) => (
                <div key={r.id} style={{
                  display: 'grid', gridTemplateColumns: '1.15fr 1fr 0.95fr 74px 84px',
                  gap: 12, alignItems: 'center', padding: '12px 20px',
                  borderBottom: i < reservations.length - 1 ? '1px solid var(--border-2)' : 'none',
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{r.customer}</div>
                    <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: 10.5, color: 'var(--faint)' }}>{r.id}</div>
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{r.moto}</div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--ink)' }}>{r.period}</div>
                    <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: 10, color: 'var(--faint)' }}>{r.days} day{r.days !== 1 ? 's' : ''}</div>
                  </div>
                  <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: 12.5, color: 'var(--ink)' }}>{r.amount}</div>
                  <Pill status={r.status} />
                </div>
              ))}
            </div>

            <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '17px 20px 13px' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Maintenance alerts</div>
                <span style={{
                  fontFamily: "'Geist Mono',monospace", fontSize: 10,
                  color: 'var(--cmy-amber)',
                  background: 'color-mix(in srgb,var(--cmy-amber) 15%,transparent)',
                  padding: '3px 7px', borderRadius: 999,
                }}>7 open</span>
              </div>
              {alerts.map((a, i) => {
                const dotColor = a.sev === 'critical' ? 'var(--cmy-red)' : a.sev === 'warning' ? 'var(--cmy-amber)' : 'var(--cmy-green)';
                const dueColor = a.sev === 'critical' ? 'var(--cmy-red)' : a.sev === 'warning' ? 'var(--cmy-amber)' : 'var(--faint)';
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 11,
                    padding: '13px 20px', borderTop: '1px solid var(--border-2)',
                  }}>
                    <span style={{ marginTop: 2, width: 7, height: 7, borderRadius: 999, background: dotColor, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{a.title}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--faint)' }}>
                        {a.moto} · <span style={{ fontFamily: "'Geist Mono',monospace" }}>{a.id}</span> · {a.km}
                      </div>
                    </div>
                    <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 11, color: dueColor, flexShrink: 0 }}>
                      due {a.due}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ PANE B: YARD VIEW ══════════════ */}
      {pane === 'B' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: 16, marginBottom: 16 }}>
            {/* Hero */}
            <div style={{ ...card, borderRadius: 18, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--faint)' }}>
                  Today at the yard
                </div>
                <h2 style={{ margin: '14px 0 0', fontFamily: "'Cormorant Garamond',serif", fontSize: 64, lineHeight: 0.92, fontWeight: 600, color: 'var(--ink)' }}>
                  93<span style={{ color: 'var(--faint)', fontSize: 30 }}> / 163</span>
                </h2>
                <p style={{ margin: '8px 0 0', fontSize: 13.5, color: 'var(--muted)', maxWidth: '34ch' }}>
                  motorcycles ready to ride. The rest are out on rent, reserved, or in the workshop.
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 26, paddingTop: 22, borderTop: '1px solid var(--border-2)' }}>
                {[
                  { value: '€90.2k', label: 'revenue this month' },
                  { value: '142',    label: 'active rentals' },
                  { value: '4.9★',  label: 'avg. customer rating' },
                  { value: '7',      label: 'need service', color: 'var(--cmy-amber)' },
                ].map((s, i) => (
                  <div key={i}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 34, fontWeight: 600, lineHeight: 1, color: s.color || 'var(--ink)' }}>
                      {s.value}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--faint)', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Yard map */}
            <div style={{ ...card, borderRadius: 18, padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Yard map</div>
                  <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 2 }}>Live status, every bay</div>
                </div>
                <div style={{ display: 'flex', gap: 13, fontSize: 11, color: 'var(--muted)' }}>
                  {[
                    { c: 'var(--cmy-green)', l: 'Free' },
                    { c: 'var(--brand)',     l: 'Rented' },
                    { c: 'var(--cmy-amber)', l: 'Service' },
                  ].map(leg => (
                    <span key={leg.l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 3, background: leg.c }} />{leg.l}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(14,1fr)', gap: 6 }}>
                {yardTiles.map((t, i) => (
                  <div key={i} style={{
                    aspectRatio: '1', borderRadius: 5,
                    background: t === 'green' ? 'var(--cmy-green)' : t === 'brand' ? 'var(--brand)' : t === 'amber' ? 'var(--cmy-amber)' : 'var(--faint)',
                    opacity: t === 'faint' ? 0.4 : 1,
                  }} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontFamily: "'Geist Mono',monospace", fontSize: 10.5, color: 'var(--faint)' }}>
                <span>Bay A01</span><span>Bay D14</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 16 }}>
            {/* Occupancy timeline */}
            <div style={{ ...card, borderRadius: 18, padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Occupancy timeline</div>
                  <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 2 }}>Next 7 days · top bikes</div>
                </div>
                <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 10.5, color: 'var(--faint)' }}>MON — SUN</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                {occupancy.map((row, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 96, fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>{row.name}</span>
                    <div style={{ flex: 1, position: 'relative', height: 14, background: 'var(--surface-2)', borderRadius: 999 }}>
                      <div style={{
                        position: 'absolute', left: row.l, width: row.w, top: 0, bottom: 0,
                        borderRadius: 999, background: row.c,
                        opacity: row.dim ?? 1,
                        border: row.dashed ? '1px dashed var(--cmy-amber)' : 'none',
                      }} />
                      {row.r && (
                        <div style={{
                          position: 'absolute', left: row.r.l, width: row.r.w,
                          top: 0, bottom: 0, borderRadius: 999,
                          background: 'var(--brand)', opacity: 0.45,
                        }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rentals per day */}
            <div style={{ ...card, borderRadius: 18, padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Rentals per day</div>
                  <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 2 }}>Last 14 days</div>
                </div>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 30, fontWeight: 600, lineHeight: 1, color: 'var(--ink)' }}>
                  28<span style={{ fontSize: 14, color: 'var(--faint)' }}> avg</span>
                </span>
              </div>
              <div style={{ height: 150 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barsData} margin={{ top: 0, right: 0, left: -32, bottom: 0 }} barSize={14}>
                    <Bar dataKey="v" fill="var(--brand)" radius={[4, 4, 2, 2]} opacity={0.85} />
                    <XAxis hide />
                    <YAxis hide />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontFamily: "'Geist Mono',monospace", fontSize: 10, color: 'var(--faint)' }}>
                <span>Jun 08</span><span>Jun 14</span><span>Jun 21</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
