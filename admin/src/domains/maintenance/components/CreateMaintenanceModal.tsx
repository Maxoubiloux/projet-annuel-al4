import { useState } from 'react';
import { Modal } from '@/core/components/ui/Modal';
import { FormField } from '@/core/components/ui/FormField';
import { fieldInputStyle, fieldTextareaStyle } from '@/core/utils/formStyles';
import { Button } from '@/core/components/ui/Button';
import { useToast } from '@/core/components/ToastProvider';
import { useAsync } from '@/core/hooks/useAsync';
import { useFormValidation } from '@/core/hooks/useFormValidation';
import { api } from '@/core/services/api';
import { useMotos } from '@/domains/motos/hooks/useMotos';
import { maintenanceJobSchema } from '../schema';
import type { MaintenanceSeverity, MaintenanceStatus } from '../types';

const SEV_OPTIONS: { key: MaintenanceSeverity; label: string }[] = [
  { key: 'critical', label: 'Critical' },
  { key: 'warning', label: 'Warning' },
  { key: 'ok', label: 'OK' },
];

const STATUS_OPTIONS: { key: MaintenanceStatus; label: string }[] = [
  { key: 'open', label: 'Open' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'completed', label: 'Done' },
];

interface FormState {
  motoId: string;
  type: string;
  date: string;
  km: string;
  cost: number;
  sev: MaintenanceSeverity;
  status: MaintenanceStatus;
  notes: string;
}

const EMPTY_FORM: FormState = {
  motoId: '', type: '', date: '', km: '', cost: 0, sev: 'warning', status: 'open', notes: '',
};

export function CreateMaintenanceModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { data: motos } = useMotos();
  const { success, error } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const selectedMoto = motos.find(m => m.id === form.motoId);

  const { isLoading, execute } = useAsync(() => api.post('/maintenance', {
    motoId: form.motoId,
    moto: selectedMoto ? `${selectedMoto.brand} ${selectedMoto.model}` : '',
    plate: selectedMoto?.plate ?? '',
    type: form.type,
    date: form.date,
    km: form.km,
    cost: form.cost,
    sev: form.sev,
    status: form.status,
    notes: form.notes || undefined,
  }));

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(f => ({ ...f, [key]: value }));

  const { isValid, errors, touch } = useFormValidation(maintenanceJobSchema, form);

  const handleSubmit = async () => {
    touch();
    if (!isValid) return;
    const result = await execute();
    if (result !== undefined) {
      success('Maintenance job created');
      onCreated();
      onClose();
    } else {
      error('Failed to create maintenance job');
    }
  };

  return (
    <Modal
      title="New maintenance job"
      subtitle="Schedule a service or repair"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" size="md" style={{ flex: 1 }} onClick={onClose}>Cancel</Button>
          <Button size="md" style={{ flex: 1 }} disabled={!isValid || isLoading} onClick={handleSubmit}>
            {isLoading ? 'Creating…' : 'Create job'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FormField label="Motorcycle" error={errors.motoId}>
          <select style={fieldInputStyle} value={form.motoId} onChange={e => set('motoId', e.target.value)}>
            <option value="">Select a motorcycle…</option>
            {motos.map(m => (
              <option key={m.id} value={m.id}>{m.brand} {m.model} — {m.plate}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Job type" error={errors.type}>
          <input style={fieldInputStyle} value={form.type} onChange={e => set('type', e.target.value)} placeholder="Oil change" />
        </FormField>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <FormField label="Due date" error={errors.date}>
              <input type="date" style={fieldInputStyle} value={form.date} onChange={e => set('date', e.target.value)} />
            </FormField>
          </div>
          <div style={{ flex: 1 }}>
            <FormField label="Mileage (km)" error={errors.km}>
              <input style={fieldInputStyle} value={form.km} onChange={e => set('km', e.target.value)} placeholder="12500" />
            </FormField>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <FormField label="Estimated cost (€)" error={errors.cost}>
              <input type="number" min={0} style={fieldInputStyle} value={form.cost} onChange={e => set('cost', Number(e.target.value))} />
            </FormField>
          </div>
          <div style={{ flex: 1 }}>
            <FormField label="Severity">
              <select style={fieldInputStyle} value={form.sev} onChange={e => set('sev', e.target.value as MaintenanceSeverity)}>
                {SEV_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </FormField>
          </div>
          <div style={{ flex: 1 }}>
            <FormField label="Status">
              <select style={fieldInputStyle} value={form.status} onChange={e => set('status', e.target.value as MaintenanceStatus)}>
                {STATUS_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </FormField>
          </div>
        </div>

        <FormField label="Notes (optional)">
          <textarea style={fieldTextareaStyle} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Details about the job…" />
        </FormField>
      </div>
    </Modal>
  );
}
