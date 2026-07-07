import { useState } from 'react';
import { Save } from 'lucide-react';
import { useLayout } from '@/core/hooks/useLayout';
import { Button } from '@/core/components/ui/Button';

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

function Toggle({ label, desc, on, onChange }: { label: string; desc: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', borderTop: '1px solid var(--border-2)' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{label}</div>
        <div style={{ fontSize: 11.5, color: 'var(--faint)', marginTop: 2 }}>{desc}</div>
      </div>
      <button
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => onChange(!on)}
        style={{
          position: 'relative', width: 38, height: 22, borderRadius: 999,
          background: on ? 'var(--brand)' : 'var(--border)',
          cursor: 'pointer', flexShrink: 0,
          border: 'none', padding: 0,
          transition: 'background .18s',
        }}
      >
        <div style={{
          position: 'absolute', top: 2, left: on ? 18 : 2, width: 18, height: 18,
          borderRadius: 999, background: '#fff',
          boxShadow: '0 1px 2px rgba(0,0,0,.25)',
          transition: 'left .18s',
        }} />
      </button>
    </div>
  );
}

/* ── Save feedback toast (local only — TODO: connect to PUT /api/settings) ── */
function useSaveToast() {
  const [saved, setSaved] = useState(false);
  const trigger = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  return { saved, trigger };
}

export function SettingsPage() {
  const { theme, toggleTheme, collapsed, toggleCollapsed } = useLayout();
  const bookingToast = useSaveToast();
  const companyToast = useSaveToast();

  /* Booking rules — controlled inputs */
  const [rules, setRules] = useState({ minDays: 1, maxDays: 30, minAge: 21, freeCancelHours: 48 });

  /* Company info — controlled inputs */
  const [company, setCompany] = useState({
    name: 'City Moto Yard',
    address: '12 Rue des Motards, 75011 Paris',
    email: 'contact@citymotoyard.fr',
    phone: '+33 1 42 00 00 00',
  });

  /* Appearance toggles */
  const [emailNotif, setEmailNotif] = useState(true);

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
              <input
                type="number" value={rules.minDays} style={inputStyle}
                onChange={e => setRules(r => ({ ...r, minDays: +e.target.value }))}
              />
            </Field>
            <Field label="Maximum rental duration (days)">
              <input
                type="number" value={rules.maxDays} style={inputStyle}
                onChange={e => setRules(r => ({ ...r, maxDays: +e.target.value }))}
              />
            </Field>
            <Field label="Minimum driver age">
              <input
                type="number" value={rules.minAge} style={inputStyle}
                onChange={e => setRules(r => ({ ...r, minAge: +e.target.value }))}
              />
            </Field>
            <Field label="Free cancellation window (hours)">
              <input
                type="number" value={rules.freeCancelHours} style={inputStyle}
                onChange={e => setRules(r => ({ ...r, freeCancelHours: +e.target.value }))}
              />
            </Field>
          </div>
          {/* TODO: connect onClick to PUT /api/settings/rules */}
          <Button
            size="md"
            style={{ marginTop: 16, background: bookingToast.saved ? 'var(--cmy-green)' : undefined, transition: 'background .2s' }}
            onClick={bookingToast.trigger}
          >
            <Save size={14} strokeWidth={1.6} />
            {bookingToast.saved ? 'Saved!' : 'Save rules'}
          </Button>
        </Section>

        {/* Company info */}
        <Section title="Company information" desc="Shown on invoices and rental contracts.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Company name">
              <input
                value={company.name} style={inputStyle}
                onChange={e => setCompany(c => ({ ...c, name: e.target.value }))}
              />
            </Field>
            <Field label="Address">
              <input
                value={company.address} style={inputStyle}
                onChange={e => setCompany(c => ({ ...c, address: e.target.value }))}
              />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Contact email">
                <input
                  type="email" value={company.email} style={inputStyle}
                  onChange={e => setCompany(c => ({ ...c, email: e.target.value }))}
                />
              </Field>
              <Field label="Phone">
                <input
                  value={company.phone} style={inputStyle}
                  onChange={e => setCompany(c => ({ ...c, phone: e.target.value }))}
                />
              </Field>
            </div>
          </div>
          {/* TODO: connect onClick to PUT /api/settings/company */}
          <Button
            size="md"
            style={{ marginTop: 16, background: companyToast.saved ? 'var(--cmy-green)' : undefined, transition: 'background .2s' }}
            onClick={companyToast.trigger}
          >
            <Save size={14} strokeWidth={1.6} />
            {companyToast.saved ? 'Saved!' : 'Save company info'}
          </Button>
        </Section>

        {/* Appearance */}
        <Section title="Appearance" desc="Interface preferences, persisted in localStorage.">
          <div>
            {/* Dark mode — driven by useLayout (persists in localStorage) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0 13px' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>Dark mode</div>
                <div style={{ fontSize: 11.5, color: 'var(--faint)', marginTop: 2 }}>Switch to the dark theme</div>
              </div>
              <button
                role="switch"
                aria-checked={theme === 'dark'}
                aria-label="Dark mode"
                onClick={toggleTheme}
                style={{
                  position: 'relative', width: 38, height: 22, borderRadius: 999,
                  background: theme === 'dark' ? 'var(--brand)' : 'var(--border)',
                  cursor: 'pointer', flexShrink: 0, border: 'none', padding: 0,
                  transition: 'background .18s',
                }}
              >
                <div style={{
                  position: 'absolute', top: 2, left: theme === 'dark' ? 18 : 2, width: 18, height: 18,
                  borderRadius: 999, background: '#fff',
                  boxShadow: '0 1px 2px rgba(0,0,0,.25)',
                  transition: 'left .18s',
                }} />
              </button>
            </div>
            {/* Compact sidebar — driven by useLayout (persists in localStorage) */}
            <Toggle
              label="Compact sidebar"
              desc="Always collapse the sidebar to icon-only mode"
              on={collapsed}
              onChange={toggleCollapsed}
            />
            {/* Email notifications — local preference (TODO: persist via PUT /api/settings/preferences) */}
            <Toggle
              label="Email notifications"
              desc="Receive an email for new reservations and overdue returns"
              on={emailNotif}
              onChange={setEmailNotif}
            />
          </div>
        </Section>
      </div>
    </div>
  );
}
