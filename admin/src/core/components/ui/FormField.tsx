import type { ReactNode } from 'react';

export function FormField({ label, children, error }: { label: string; children: ReactNode; error?: string }) {
  return (
    <div>
      <div style={{
        fontSize: 11, fontWeight: 600, color: 'var(--faint)',
        textTransform: 'uppercase', letterSpacing: '.06em',
        marginBottom: 6, fontFamily: "'Geist Mono',monospace",
      }}>
        {label}
      </div>
      {children}
      {error && <div style={{ fontSize: 11.5, color: 'var(--cmy-red)', marginTop: 4 }}>{error}</div>}
    </div>
  );
}
