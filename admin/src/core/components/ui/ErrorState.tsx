import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/core/components/ui/Button';

export function ErrorState({
  message = "Impossible de charger les données.",
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      padding: '40px 20px', textAlign: 'center',
    }}>
      <AlertTriangle size={22} strokeWidth={1.6} style={{ color: 'var(--cmy-red)' }} />
      <div style={{ fontSize: 13, color: 'var(--muted)', maxWidth: 360 }}>{message}</div>
      <Button variant="secondary" size="sm" onClick={onRetry}>
        <RefreshCw size={13} strokeWidth={1.6} />Retry
      </Button>
    </div>
  );
}
