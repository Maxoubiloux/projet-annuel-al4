import { Save } from 'lucide-react';
import { useLayout } from '@/core/hooks/useLayout';

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 16, boxShadow: 'var(--shadow)', overflow: 'hidden',
    }}>
      <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-2)' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 3 }}>{desc}</div>
      </div>
      <div style={{ padding: '20px 22px' }}>{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink)' }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  height: 36, padding: '0 12px',
  background: 'var(--surface-2)', border: '1px solid var(--border)',
  borderRadius: 9, fontSize: 13, color: 'var(--ink)', outline: 'none',
  fontFamily: "'Geist',system-ui,sans-serif",
};

function Toggle({ label, desc, on }: { label: string; desc: string; on: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', borderTop: '1px solid var(--border-2)' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{label}</div>
        <div style={{ fontSize: 11.5, color: 'var(--faint)', marginTop: 2 }}>{desc}</div>
      </div>
      <div style={{
        position: 'relative', width: 38, height: 22, borderRadius: 999,
        background: on ? 'var(--brand)' : 'var(--border)', cursor: 'pointer', flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: 2, left: on ? 18 : 2, width: 18, height: 18,
          borderRadius: 999, background: '#fff',
          boxShadow: '0 1px 2px rgba(0,0,0,.25)',
          transition: 'left .18s',
        }} />
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { theme, toggleTheme } = useLayout();

  const saveBtn: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 16,
    height: 36, padding: '0 16px',
    background: 'var(--brand)', color: '#fff',
    border: 'none', borderRadius: 9,
    fontSize: 13, fontWeight: 500, cursor: 'pointer',
  };

  return (
    <div style={{ maxWidth: 780 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontFamily: "'Cormorant Garamond',serif", fontSize: 30, fontWeight: 600, letterSpacing: '.01em', lineHeight: 1.05, color: 'var(--ink)' }}>Settings</h1>
        <p style={{ margin: '5px 0 0', fontSize: 13.5, color: 'var(--muted)' }}>Platform configuration for City Moto Yard</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Booking rules */}
        <Section title="Booking rules" desc="Set constraints that apply to all rentals.">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Minimum rental duration (days)">
              <input type="number" defaultValue={1} style={inputStyle} />
            </Field>
            <Field label="Maximum rental duration (days)">
              <input type="number" defaultValue={30} style={inputStyle} />
            </Field>
            <Field label="Minimum driver age">
              <input type="number" defaultValue={21} style={inputStyle} />
            </Field>
            <Field label="Free cancellation window (hours)">
              <input type="number" defaultValue={48} style={inputStyle} />
            </Field>
          </div>
          <button style={saveBtn}><Save size={14} strokeWidth={1.6} />Save rules</button>
        </Section>

        {/* Company info */}
        <Section title="Company information" desc="Shown on invoices and rental contracts.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Company name">
              <input defaultValue="City Moto Yard" style={inputStyle} />
            </Field>
            <Field label="Address">
              <input defaultValue="12 Rue des Motards, 75011 Paris" style={inputStyle} />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Contact email">
                <input type="email" defaultValue="contact@citymotoyard.fr" style={inputStyle} />
              </Field>
              <Field label="Phone">
                <input defaultValue="+33 1 42 00 00 00" style={inputStyle} />
              </Field>
            </div>
          </div>
          <button style={saveBtn}><Save size={14} strokeWidth={1.6} />Save company info</button>
        </Section>

        {/* Appearance */}
        <Section title="Appearance" desc="Interface preferences for this session.">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0 13px' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>Dark mode</div>
                <div style={{ fontSize: 11.5, color: 'var(--faint)', marginTop: 2 }}>Switch to the dark theme</div>
              </div>
              <div
                onClick={toggleTheme}
                style={{
                  position: 'relative', width: 38, height: 22, borderRadius: 999,
                  background: theme === 'dark' ? 'var(--brand)' : 'var(--border)',
                  cursor: 'pointer', flexShrink: 0,
                }}
              >
                <div style={{
                  position: 'absolute', top: 2, left: theme === 'dark' ? 18 : 2, width: 18, height: 18,
                  borderRadius: 999, background: '#fff',
                  boxShadow: '0 1px 2px rgba(0,0,0,.25)',
                  transition: 'left .18s',
                }} />
              </div>
            </div>
            <Toggle label="Compact sidebar" desc="Always collapse the sidebar to icon-only mode" on={false} />
            <Toggle label="Email notifications" desc="Receive an email for new reservations and overdue returns" on={true} />
          </div>
        </Section>
      </div>
    </div>
  );
}
