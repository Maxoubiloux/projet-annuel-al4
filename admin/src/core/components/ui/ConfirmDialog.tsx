import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,.5)',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 16, boxShadow: 'var(--shadow)',
          width: 380, maxWidth: '90vw', padding: '28px 24px 22px',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 18 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: danger
              ? 'color-mix(in srgb,var(--cmy-red) 12%,transparent)'
              : 'color-mix(in srgb,var(--cmy-amber) 14%,transparent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle
              size={18}
              strokeWidth={1.8}
              style={{ color: danger ? 'var(--cmy-red)' : 'var(--cmy-amber)' }}
            />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.2 }}>{title}</div>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{message}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              height: 34, padding: '0 16px',
              border: '1px solid var(--border)', background: 'var(--surface-2)',
              borderRadius: 8, fontSize: 13, color: 'var(--ink)', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              height: 34, padding: '0 16px', border: 'none',
              background: danger ? 'var(--cmy-red)' : 'var(--brand)',
              color: '#fff', borderRadius: 8,
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
