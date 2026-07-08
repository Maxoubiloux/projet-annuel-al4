import { useState } from 'react';
import { Modal } from '@/core/components/ui/Modal';
import { FormField } from '@/core/components/ui/FormField';
import { fieldInputStyle, fieldTextareaStyle } from '@/core/utils/formStyles';
import { Button } from '@/core/components/ui/Button';
import { useToast } from '@/core/components/ToastProvider';
import { useAsync } from '@/core/hooks/useAsync';
import { api } from '@/core/services/api';
import type { Moto, MotoStatus } from '../types';

const STATUS_OPTIONS: { key: MotoStatus; label: string }[] = [
  { key: 'available', label: 'Available' },
  { key: 'reserved', label: 'On rent' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'inactive', label: 'Inactive' },
];

type FormState = Omit<Moto, 'id'>;

const EMPTY_FORM: FormState = {
  brand: '', model: '', plate: '', year: new Date().getFullYear(),
  category: '', mileage: 0, pricePerDay: 0, deposit: 0,
  status: 'available', location: '', description: '', imageUrl: '', nextServiceDate: '',
};

export function CreateMotoModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { success, error } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const { isLoading, execute } = useAsync(() => api.post('/motos', form));

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(f => ({ ...f, [key]: value }));

  const isValid = form.brand.trim() && form.model.trim() && form.plate.trim() &&
    form.category.trim() && form.location.trim() && form.description.trim();

  const handleSubmit = async () => {
    if (!isValid) return;
    const result = await execute();
    if (result !== undefined) {
      success('Motorcycle created');
      onCreated();
      onClose();
    } else {
      error('Failed to create motorcycle');
    }
  };

  return (
    <Modal
      title="Add motorcycle"
      subtitle="Register a new motorcycle in the fleet"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" size="md" style={{ flex: 1 }} onClick={onClose}>Cancel</Button>
          <Button size="md" style={{ flex: 1 }} disabled={!isValid || isLoading} onClick={handleSubmit}>
            {isLoading ? 'Creating…' : 'Create motorcycle'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <FormField label="Brand">
              <input style={fieldInputStyle} value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="Honda" />
            </FormField>
          </div>
          <div style={{ flex: 1 }}>
            <FormField label="Model">
              <input style={fieldInputStyle} value={form.model} onChange={e => set('model', e.target.value)} placeholder="CB500X" />
            </FormField>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <FormField label="Plate">
              <input style={fieldInputStyle} value={form.plate} onChange={e => set('plate', e.target.value)} placeholder="AB-123-CD" />
            </FormField>
          </div>
          <div style={{ width: 110 }}>
            <FormField label="Year">
              <input type="number" style={fieldInputStyle} value={form.year} onChange={e => set('year', Number(e.target.value))} />
            </FormField>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <FormField label="Category">
              <input style={fieldInputStyle} value={form.category} onChange={e => set('category', e.target.value)} placeholder="Adventure" />
            </FormField>
          </div>
          <div style={{ flex: 1 }}>
            <FormField label="Status">
              <select style={fieldInputStyle} value={form.status} onChange={e => set('status', e.target.value as MotoStatus)}>
                {STATUS_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </FormField>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <FormField label="Mileage (km)">
              <input type="number" min={0} style={fieldInputStyle} value={form.mileage} onChange={e => set('mileage', Number(e.target.value))} />
            </FormField>
          </div>
          <div style={{ flex: 1 }}>
            <FormField label="Price / day (€)">
              <input type="number" min={0} style={fieldInputStyle} value={form.pricePerDay} onChange={e => set('pricePerDay', Number(e.target.value))} />
            </FormField>
          </div>
          <div style={{ flex: 1 }}>
            <FormField label="Deposit (€)">
              <input type="number" min={0} style={fieldInputStyle} value={form.deposit} onChange={e => set('deposit', Number(e.target.value))} />
            </FormField>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <FormField label="Location">
              <input style={fieldInputStyle} value={form.location} onChange={e => set('location', e.target.value)} placeholder="Paris — Bastille" />
            </FormField>
          </div>
          <div style={{ flex: 1 }}>
            <FormField label="Next service date">
              <input type="date" style={fieldInputStyle} value={form.nextServiceDate ?? ''} onChange={e => set('nextServiceDate', e.target.value)} />
            </FormField>
          </div>
        </div>

        <FormField label="Image URL (optional)">
          <input style={fieldInputStyle} value={form.imageUrl ?? ''} onChange={e => set('imageUrl', e.target.value)} placeholder="https://…" />
        </FormField>

        <FormField label="Description">
          <textarea style={fieldTextareaStyle} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Notes about condition, equipment…" />
        </FormField>
      </div>
    </Modal>
  );
}
