import { useState } from 'react';
import { Modal } from '@/core/components/ui/Modal';
import { FormField } from '@/core/components/ui/FormField';
import { fieldInputStyle } from '@/core/utils/formStyles';
import { Button } from '@/core/components/ui/Button';
import { useToast } from '@/core/components/ToastProvider';
import { useAsync } from '@/core/hooks/useAsync';
import { api } from '@/core/services/api';
import { useMotos } from '@/domains/motos/hooks/useMotos';
import { useCustomers } from '@/domains/customers/hooks/useCustomers';
import type { PaymentStatus, Reservation, ReservationStatus } from '../types';

const STATUS_OPTIONS: { key: ReservationStatus; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'in_progress', label: 'Active' },
  { key: 'completed', label: 'Done' },
  { key: 'cancelled', label: 'Cancelled' },
];

const PAYMENT_OPTIONS: { key: PaymentStatus; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'paid', label: 'Paid' },
  { key: 'failed', label: 'Failed' },
  { key: 'refunded', label: 'Refunded' },
];

type FormState = Omit<Reservation, 'id' | 'createdAt'>;

const EMPTY_FORM: FormState = {
  motoId: '', customerId: '', startDate: '', endDate: '',
  totalAmount: 0, depositAmount: 0, status: 'pending', paymentStatus: 'pending',
};

export function CreateReservationModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { data: motos } = useMotos();
  const { data: customers } = useCustomers();
  const { success, error } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const { isLoading, execute } = useAsync(() => api.post('/reservations', form));

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(f => ({ ...f, [key]: value }));

  const isValid = form.motoId && form.customerId && form.startDate && form.endDate &&
    form.endDate >= form.startDate && form.totalAmount > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    const result = await execute();
    if (result !== undefined) {
      success('Reservation created');
      onCreated();
      onClose();
    } else {
      error('Failed to create reservation');
    }
  };

  return (
    <Modal
      title="New reservation"
      subtitle="Book a motorcycle for a customer"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" size="md" style={{ flex: 1 }} onClick={onClose}>Cancel</Button>
          <Button size="md" style={{ flex: 1 }} disabled={!isValid || isLoading} onClick={handleSubmit}>
            {isLoading ? 'Creating…' : 'Create reservation'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FormField label="Customer">
          <select style={fieldInputStyle} value={form.customerId} onChange={e => set('customerId', e.target.value)}>
            <option value="">Select a customer…</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Motorcycle">
          <select style={fieldInputStyle} value={form.motoId} onChange={e => set('motoId', e.target.value)}>
            <option value="">Select a motorcycle…</option>
            {motos.map(m => (
              <option key={m.id} value={m.id}>{m.brand} {m.model} — {m.plate}</option>
            ))}
          </select>
        </FormField>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <FormField label="Start date">
              <input type="date" style={fieldInputStyle} value={form.startDate} onChange={e => set('startDate', e.target.value)} />
            </FormField>
          </div>
          <div style={{ flex: 1 }}>
            <FormField label="End date">
              <input type="date" style={fieldInputStyle} min={form.startDate || undefined} value={form.endDate} onChange={e => set('endDate', e.target.value)} />
            </FormField>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <FormField label="Total amount (€)">
              <input type="number" min={0} style={fieldInputStyle} value={form.totalAmount} onChange={e => set('totalAmount', Number(e.target.value))} />
            </FormField>
          </div>
          <div style={{ flex: 1 }}>
            <FormField label="Deposit (€)">
              <input type="number" min={0} style={fieldInputStyle} value={form.depositAmount} onChange={e => set('depositAmount', Number(e.target.value))} />
            </FormField>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <FormField label="Status">
              <select style={fieldInputStyle} value={form.status} onChange={e => set('status', e.target.value as ReservationStatus)}>
                {STATUS_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </FormField>
          </div>
          <div style={{ flex: 1 }}>
            <FormField label="Payment">
              <select style={fieldInputStyle} value={form.paymentStatus} onChange={e => set('paymentStatus', e.target.value as PaymentStatus)}>
                {PAYMENT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </FormField>
          </div>
        </div>
      </div>
    </Modal>
  );
}
