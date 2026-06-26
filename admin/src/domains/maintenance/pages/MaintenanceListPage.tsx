import { Plus, Wrench } from 'lucide-react';

const MAINTENANCE = [
  { id: 'm1', moto: 'Kawasaki Z900',        plate: 'CMY-072', type: 'Brake service overdue',  date: '2026-06-23', km: '18,400', cost: 280, sev: 'critical', status: 'open'       },
  { id: 'm2', moto: 'Ducati Monster 937',   plate: 'CMY-038', type: 'Oil change',              date: '2026-06-28', km: '12,050', cost: 95,  sev: 'warning',  status: 'open'       },
  { id: 'm3', moto: 'BMW R nineT',          plate: 'CMY-119', type: 'Tire wear inspection',    date: '2026-06-30', km: '9,800',  cost: 60,  sev: 'warning',  status: 'open'       },
  { id: 'm4', moto: 'Triumph Street Triple',plate: 'CMY-051', type: 'Chain lubrication',       date: '2026-07-04', km: '15,600', cost: 40,  sev: 'ok',       status: 'scheduled'  },
  { id: 'm5', moto: 'Honda CB650R',         plate: 'CMY-088', type: 'Annual inspection',       date: '2026-07-08', km: '7,200',  cost: 200, sev: 'ok',       status: 'scheduled'  },
  { id: 'm6', moto: 'Yamaha MT-07',         plate: 'CMY-014', type: 'Brake pad replacement',   date: '2026-06-15', km: '22,100', cost: 120, sev: 'ok',       status: 'completed'  },
  { id: 'm7', moto: 'Vespa GTS 300',        plate: 'CMY-033', type: 'Spark plug change',       date: '2026-06-10', km: '11,400', cost: 55,  sev: 'ok',       status: 'completed'  },
];

type Sev = 'critical' | 'warning' | 'ok';
type Stat = 'open' | 'scheduled' | 'completed';

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

export function MaintenanceListPage() {
  const open = MAINTENANCE.filter(m => m.status === 'open').length;

  const card: React.CSSProperties = {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 16, boxShadow: 'var(--shadow)',
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "'Cormorant Garamond',serif", fontSize: 30, fontWeight: 600, letterSpacing: '.01em', lineHeight: 1.05, color: 'var(--ink)' }}>Maintenance</h1>
          <p style={{ margin: '5px 0 0', fontSize: 13.5, color: 'var(--muted)' }}>
            {MAINTENANCE.length} records ·{' '}
            <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 12, color: 'var(--cmy-red)' }}>{open} open</span>
          </p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 7, height: 36, padding: '0 14px',
          background: 'var(--brand)', color: '#fff',
          border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer',
        }}>
          <Plus size={15} strokeWidth={1.6} />New job
        </button>
      </div>

      <div style={{ ...card, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '12px 2fr 1.4fr 1fr 80px 80px 100px 60px',
          gap: 12, alignItems: 'center', padding: '11px 20px',
          fontFamily: "'Geist Mono',monospace", fontSize: 10,
          letterSpacing: '.08em', textTransform: 'uppercase',
          color: 'var(--faint)', background: 'var(--surface-2)',
          borderBottom: '1px solid var(--border-2)',
        }}>
          <span />
          <span>Motorcycle</span>
          <span>Job</span>
          <span>Due date</span>
          <span>Mileage</span>
          <span>Est. cost</span>
          <span>Status</span>
          <span />
        </div>

        {MAINTENANCE.map(m => (
          <div key={m.id} style={{
            display: 'grid', gridTemplateColumns: '12px 2fr 1.4fr 1fr 80px 80px 100px 60px',
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
            <button style={{
              height: 28, padding: '0 10px', border: '1px solid var(--border)',
              background: 'transparent', borderRadius: 7, fontSize: 11.5,
              color: 'var(--muted)', cursor: 'pointer',
            }}>Details</button>
          </div>
        ))}
      </div>
    </div>
  );
}
