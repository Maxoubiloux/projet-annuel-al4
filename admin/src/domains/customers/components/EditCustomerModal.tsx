import { useState } from 'react';
import { Modal } from '@/core/components/ui/Modal';
import { FormField } from '@/core/components/ui/FormField';
import { fieldInputStyle } from '@/core/utils/formStyles';
import { Button } from '@/core/components/ui/Button';
import { useToast } from '@/core/components/ToastProvider';
import { useAsync } from '@/core/hooks/useAsync';
import { api } from '@/core/services/api';
import type { Customer } from '@/domains/reservations/types';

type FormState = Pick<Customer, 'firstName' | 'lastName' | 'email' | 'phone' | 'licenseNumber' | 'licenseVerified' | 'status'>;

export function EditCustomerModal({ customer, onClose, onUpdated }: { customer: Customer; onClose: () => void; onUpdated: () => void }) {
  const { success, error } = useToast();
  const [form, setForm] = useState<FormState>({
    firstName: customer.firstName, lastName: customer.lastName, email: customer.email,
    phone: customer.phone, licenseNumber: customer.licenseNumber,
    licenseVerified: customer.licenseVerified, status: customer.status,
  });
  const { isLoading, execute } = useAsync(() => api.put(`/customers/${customer.id}`, form));

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(f => ({ ...f, [key]: value }));

  const isValid = form.firstName.trim() && form.lastName.trim() &&
    /\S+@\S+\.\S+/.test(form.email) && form.phone.trim() && form.licenseNumber.trim();

  const handleSubmit = async () => {
    if (!isValid) return;
    const result = await execute();
    if (result !== undefined) {
      success('Customer updated');
      onUpdated();
      onClose();
    } else {
      error('Failed to update customer');
    }
  };

  return (
    <Modal
      title="Edit customer"
      subtitle={`${customer.firstName} ${customer.lastName}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" size="md" style={{ flex: 1 }} onClick={onClose}>Cancel</Button>
          <Button size="md" style={{ flex: 1 }} disabled={!isValid || isLoading} onClick={handleSubmit}>
            {isLoading ? 'Saving…' : 'Save changes'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <FormField label="First name">
              <input style={fieldInputStyle} value={form.firstName} onChange={e => set('firstName', e.target.value)} />
            </FormField>
          </div>
          <div style={{ flex: 1 }}>
            <FormField label="Last name">
              <input style={fieldInputStyle} value={form.lastName} onChange={e => set('lastName', e.target.value)} />
            </FormField>
          </div>
        </div>

        <FormField label="Email">
          <input type="email" style={fieldInputStyle} value={form.email} onChange={e => set('email', e.target.value)} />
        </FormField>

        <FormField label="Phone">
          <input type="tel" style={fieldInputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} />
        </FormField>

        <FormField label="Licence number">
          <input style={fieldInputStyle} value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value)} />
        </FormField>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <FormField label="Status">
              <select style={fieldInputStyle} value={form.status} onChange={e => set('status', e.target.value as Customer['status'])}>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </FormField>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', paddingBottom: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.licenseVerified}
                onChange={e => set('licenseVerified', e.target.checked)}
                style={{ width: 15, height: 15, accentColor: 'var(--brand)', cursor: 'pointer' }}
              />
              Licence verified
            </label>
          </div>
        </div>
      </div>
    </Modal>
  );
}
