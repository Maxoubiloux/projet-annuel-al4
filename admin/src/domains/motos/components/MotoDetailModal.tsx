import { Modal } from '@/core/components/ui/Modal';
import { Button } from '@/core/components/ui/Button';
import type { Moto } from '../types';

const statusLabels: Record<Moto['status'], string> = {
  available: 'Available',
  reserved: 'On rent',
  maintenance: 'Maintenance',
  inactive: 'Inactive',
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--faint)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: "'Geist Mono',monospace" }}>{label}</div>
      <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{value}</div>
    </div>
  );
}

export function MotoDetailModal({ moto, onClose }: { moto: Moto; onClose: () => void }) {
  return (
    <Modal
      title={`${moto.brand} ${moto.model}`}
      subtitle={moto.plate}
      onClose={onClose}
      footer={<Button variant="secondary" size="md" style={{ flex: 1 }} onClick={onClose}>Close</Button>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {moto.imageUrl && (
          <img
            src={moto.imageUrl}
            alt={`${moto.brand} ${moto.model}`}
            style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }}
          />
        )}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}><InfoRow label="Category" value={moto.category} /></div>
          <div style={{ flex: 1 }}><InfoRow label="Year" value={String(moto.year)} /></div>
          <div style={{ flex: 1 }}><InfoRow label="Status" value={statusLabels[moto.status] ?? moto.status} /></div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}><InfoRow label="Mileage" value={`${moto.mileage.toLocaleString('fr-FR')} km`} /></div>
          <div style={{ flex: 1 }}><InfoRow label="Price / day" value={`€${moto.pricePerDay}`} /></div>
          <div style={{ flex: 1 }}><InfoRow label="Deposit" value={`€${moto.deposit}`} /></div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}><InfoRow label="Location" value={moto.location} /></div>
          <div style={{ flex: 1 }}>
            <InfoRow
              label="Next service"
              value={moto.nextServiceDate
                ? new Date(moto.nextServiceDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                : '—'}
            />
          </div>
        </div>
        <InfoRow label="Description" value={moto.description || '—'} />
      </div>
    </Modal>
  );
}
