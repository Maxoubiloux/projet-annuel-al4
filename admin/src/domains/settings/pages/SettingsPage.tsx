import { useState } from 'react';
import { Save } from 'lucide-react';
import { useLayout } from '@/core/hooks/useLayout';
import { Button } from '@/core/components/ui/Button';
import { useToast } from '@/core/components/ToastProvider';
import { useAsync } from '@/core/hooks/useAsync';
import { useFormValidation } from '@/core/hooks/useFormValidation';
import { api } from '@/core/services/api';
import { bookingRulesSchema, companyInfoSchema } from '../schema';

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

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink)' }}>{label}</label>
      {children}
      {error && <div style={{ fontSize: 11.5, color: 'var(--cmy-red)' }}>{error}</div>}
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

export function SettingsPage() {
  const { theme, toggleTheme, collapsed, toggleCollapsed } = useLayout();
  const { success, error } = useToast();

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

  const saveRulesAction = useAsync(() => api.put('/settings/rules', rules));
  const saveCompanyAction = useAsync(() => api.put('/settings/company', company));
  const preferencesAction = useAsync((emailNotifications: boolean) =>
    api.patch('/settings/preferences', { emailNotifications }));

  const rulesValidation = useFormValidation(bookingRulesSchema, rules);
  const companyValidation = useFormValidation(companyInfoSchema, company);

  const handleSaveRules = async () => {
    rulesValidation.touch();
    if (!rulesValidation.isValid) return;
    const result = await saveRulesAction.execute();
    if (result !== undefined) success('Booking rules saved');
    else error('Failed to save booking rules');
  };

  const handleSaveCompany = async () => {
    companyValidation.touch();
    if (!companyValidation.isValid) return;
    const result = await saveCompanyAction.execute();
    if (result !== undefined) success('Company information saved');
    else error('Failed to save company information');
  };

  const handleEmailNotifChange = async (value: boolean) => {
    setEmailNotif(value);
    const result = await preferencesAction.execute(value);
    if (result === undefined) {
      setEmailNotif(!value);
      error('Failed to update preference');
    }
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
            <Field label="Minimum rental duration (days)" error={rulesValidation.errors.minDays}>
              <input
                type="number" value={rules.minDays} style={inputStyle}
                onChange={e => setRules(r => ({ ...r, minDays: +e.target.value }))}
              />
            </Field>
            <Field label="Maximum rental duration (days)" error={rulesValidation.errors.maxDays}>
              <input
                type="number" value={rules.maxDays} style={inputStyle}
                onChange={e => setRules(r => ({ ...r, maxDays: +e.target.value }))}
              />
            </Field>
            <Field label="Minimum driver age" error={rulesValidation.errors.minAge}>
              <input
                type="number" value={rules.minAge} style={inputStyle}
                onChange={e => setRules(r => ({ ...r, minAge: +e.target.value }))}
              />
            </Field>
            <Field label="Free cancellation window (hours)" error={rulesValidation.errors.freeCancelHours}>
              <input
                type="number" value={rules.freeCancelHours} style={inputStyle}
                onChange={e => setRules(r => ({ ...r, freeCancelHours: +e.target.value }))}
              />
            </Field>
          </div>
          <Button
            size="md"
            style={{ marginTop: 16 }}
            disabled={saveRulesAction.isLoading}
            onClick={handleSaveRules}
          >
            <Save size={14} strokeWidth={1.6} />
            {saveRulesAction.isLoading ? 'Saving…' : 'Save rules'}
          </Button>
        </Section>

        {/* Company info */}
        <Section title="Company information" desc="Shown on invoices and rental contracts.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Company name" error={companyValidation.errors.name}>
              <input
                value={company.name} style={inputStyle}
                onChange={e => setCompany(c => ({ ...c, name: e.target.value }))}
              />
            </Field>
            <Field label="Address" error={companyValidation.errors.address}>
              <input
                value={company.address} style={inputStyle}
                onChange={e => setCompany(c => ({ ...c, address: e.target.value }))}
              />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Contact email" error={companyValidation.errors.email}>
                <input
                  type="email" value={company.email} style={inputStyle}
                  onChange={e => setCompany(c => ({ ...c, email: e.target.value }))}
                />
              </Field>
              <Field label="Phone" error={companyValidation.errors.phone}>
                <input
                  value={company.phone} style={inputStyle}
                  onChange={e => setCompany(c => ({ ...c, phone: e.target.value }))}
                />
              </Field>
            </div>
          </div>
          <Button
            size="md"
            style={{ marginTop: 16 }}
            disabled={saveCompanyAction.isLoading}
            onClick={handleSaveCompany}
          >
            <Save size={14} strokeWidth={1.6} />
            {saveCompanyAction.isLoading ? 'Saving…' : 'Save company info'}
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
            <Toggle
              label="Email notifications"
              desc="Receive an email for new reservations and overdue returns"
              on={emailNotif}
              onChange={handleEmailNotifChange}
            />
          </div>
        </Section>
      </div>
    </div>
  );
}
