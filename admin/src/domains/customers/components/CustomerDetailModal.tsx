import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Modal } from '@/core/components/ui/Modal';
import { Button } from '@/core/components/ui/Button';
import { useCustomer } from '../hooks/useCustomer';
import { useReservations } from '@/domains/reservations/hooks/useReservations';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--faint)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: "'Geist Mono',monospace" }}>{label}</div>
      <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{value}</div>
    </div>
  );
}

export function CustomerDetailModal({ customerId, initialTab = 'profile', onClose }: {
  customerId: string;
  initialTab?: 'profile' | 'bookings';
  onClose: () => void;
}) {
  const [tab, setTab] = useState<'profile' | 'bookings'>(initialTab);
  const { data: customer, isLoading: profileLoading } = useCustomer(customerId);
  const { data: bookings, isLoading: bookingsLoading } = useReservations({ customerId, limit: 100 });

  const tabBtn = (t: 'profile' | 'bookings', label: string) => (
    <button
      onClick={() => setTab(t)}
      style={{
        fontSize: 12.5, fontWeight: 500, padding: '6px 12px', borderRadius: 7,
        border: 'none', cursor: 'pointer',
        background: tab === t ? 'var(--ink)' : 'transparent',
        color: tab === t ? 'var(--bg)' : 'var(--muted)',
      }}
    >
      {label}
    </button>
  );

  return (
    <Modal
      title={customer ? `${customer.firstName} ${customer.lastName}` : 'Customer'}
      subtitle={customer?.email}
      onClose={onClose}
      footer={<Button variant="secondary" size="md" style={{ flex: 1 }} onClick={onClose}>Close</Button>}
    >
      <div style={{ display: 'flex', gap: 3, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: 4, marginBottom: 16, width: 'fit-content' }}>
        {tabBtn('profile', 'Profile')}
        {tabBtn('bookings', 'Bookings')}
      </div>

      {tab === 'profile' && (
        profileLoading ? (
          <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--faint)', fontSize: 13 }}>Loading…</div>
        ) : !customer ? (
          <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--faint)', fontSize: 13 }}>Customer not found.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}><InfoRow label="Email" value={customer.email} /></div>
              <div style={{ flex: 1 }}><InfoRow label="Phone" value={customer.phone} /></div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}><InfoRow label="Licence number" value={customer.licenseNumber || '—'} /></div>
              <div style={{ flex: 1 }}><InfoRow label="Licence status" value={customer.licenseVerified ? 'Verified' : 'Pending'} /></div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}><InfoRow label="Status" value={customer.status === 'active' ? 'Active' : 'Suspended'} /></div>
              <div style={{ flex: 1 }}><InfoRow label="Total rentals" value={String(customer.totalRentals ?? 0)} /></div>
              <div style={{ flex: 1 }}><InfoRow label="Total spent" value={`€${(customer.totalSpent ?? 0).toLocaleString()}`} /></div>
            </div>
          </div>
        )
      )}

      {tab === 'bookings' && (
        bookingsLoading ? (
          <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--faint)', fontSize: 13 }}>Loading…</div>
        ) : bookings.length === 0 ? (
          <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--faint)', fontSize: 13 }}>No bookings yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 320, overflowY: 'auto' }}>
            {bookings.map(b => (
              <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12.5 }}>
                <div>
                  <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{b.moto?.brand} {b.moto?.model}</div>
                  <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: 10.5, color: 'var(--faint)' }}>
                    {format(parseISO(b.startDate), 'dd MMM yyyy')} → {format(parseISO(b.endDate), 'dd MMM yyyy')}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Geist Mono',monospace", fontWeight: 500, color: 'var(--ink)' }}>{b.totalAmount} €</div>
                  <div style={{ fontSize: 10.5, color: 'var(--faint)', textTransform: 'capitalize' }}>{b.status.replace('_', ' ')}</div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </Modal>
  );
}
