import { useState } from 'react';
import { Modal } from '@/core/components/ui/Modal';
import { FormField } from '@/core/components/ui/FormField';
import { fieldInputStyle, fieldTextareaStyle } from '@/core/utils/formStyles';
import { Button } from '@/core/components/ui/Button';
import { useToast } from '@/core/components/ToastProvider';
import { useAsync } from '@/core/hooks/useAsync';
import { useFormValidation } from '@/core/hooks/useFormValidation';
import { api } from '@/core/services/api';
import { motoSchema } from '../schema';
import { MotoImageField } from './MotoImageField';
import type { Moto, MotoStatus } from '../types';

const STATUS_OPTIONS: { key: MotoStatus; label: string }[] = [
  { key: 'available', label: 'Available' },
  { key: 'reserved', label: 'On rent' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'inactive', label: 'Inactive' },
];

type FormState = Omit<Moto, 'id'>;

export function EditMotoModal({ moto, onClose, onUpdated }: { moto: Moto; onClose: () => void; onUpdated: () => void }) {
  const { success, error } = useToast();
  const [form, setForm] = useState<FormState>({
    brand: moto.brand, model: moto.model, plate: moto.plate, year: moto.year,
    category: moto.category, mileage: moto.mileage, pricePerDay: moto.pricePerDay,
    deposit: moto.deposit, status: moto.status, location: moto.location,
    description: moto.description, imageUrl: moto.imageUrl ?? '', nextServiceDate: moto.nextServiceDate ?? '',
  });
  const { isLoading, execute } = useAsync(() => api.put(`/motos/${moto.id}`, form));

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(f => ({ ...f, [key]: value }));

  const { isValid, isDirty, errors, touch } = useFormValidation(motoSchema, form);

  const handleSubmit = async () => {
    touch();
    if (!isValid) return;
    const result = await execute();
    if (result !== undefined) {
      success('Motorcycle updated');
      onUpdated();
      onClose();
    } else {
      error('Failed to update motorcycle');
    }
  };

  return (
    <Modal
      title="Edit motorcycle"
      subtitle={`${moto.brand} ${moto.model} · ${moto.plate}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" size="md" style={{ flex: 1 }} onClick={onClose}>Cancel</Button>
          <Button size="md" style={{ flex: 1 }} disabled={!isDirty || !isValid || isLoading} onClick={handleSubmit}>
            {isLoading ? 'Saving…' : 'Save changes'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <FormField label="Brand" error={errors.brand}>
              <input style={fieldInputStyle} value={form.brand} onChange={e => set('brand', e.target.value)} />
            </FormField>
          </div>
          <div style={{ flex: 1 }}>
            <FormField label="Model" error={errors.model}>
              <input style={fieldInputStyle} value={form.model} onChange={e => set('model', e.target.value)} />
            </FormField>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <FormField label="Plate" error={errors.plate}>
              <input style={fieldInputStyle} value={form.plate} onChange={e => set('plate', e.target.value)} />
            </FormField>
          </div>
          <div style={{ width: 110 }}>
            <FormField label="Year" error={errors.year}>
              <input type="number" style={fieldInputStyle} value={form.year} onChange={e => set('year', Number(e.target.value))} />
            </FormField>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <FormField label="Category" error={errors.category}>
              <input style={fieldInputStyle} value={form.category} onChange={e => set('category', e.target.value)} />
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
            <FormField label="Mileage (km)" error={errors.mileage}>
              <input type="number" min={0} style={fieldInputStyle} value={form.mileage} onChange={e => set('mileage', Number(e.target.value))} />
            </FormField>
          </div>
          <div style={{ flex: 1 }}>
            <FormField label="Price / day (€)" error={errors.pricePerDay}>
              <input type="number" min={0} style={fieldInputStyle} value={form.pricePerDay} onChange={e => set('pricePerDay', Number(e.target.value))} />
            </FormField>
          </div>
          <div style={{ flex: 1 }}>
            <FormField label="Deposit (€)" error={errors.deposit}>
              <input type="number" min={0} style={fieldInputStyle} value={form.deposit} onChange={e => set('deposit', Number(e.target.value))} />
            </FormField>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <FormField label="Location" error={errors.location}>
              <input style={fieldInputStyle} value={form.location} onChange={e => set('location', e.target.value)} />
            </FormField>
          </div>
          <div style={{ flex: 1 }}>
            <FormField label="Next service date">
              <input type="date" style={fieldInputStyle} value={form.nextServiceDate ?? ''} onChange={e => set('nextServiceDate', e.target.value)} />
            </FormField>
          </div>
        </div>

        <MotoImageField value={form.imageUrl ?? ''} onChange={url => set('imageUrl', url)} />

        <FormField label="Description" error={errors.description}>
          <textarea style={fieldTextareaStyle} value={form.description} onChange={e => set('description', e.target.value)} />
        </FormField>
      </div>
    </Modal>
  );
}
