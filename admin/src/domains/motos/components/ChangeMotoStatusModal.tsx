import { useState } from 'react';
import { Modal } from '@/core/components/ui/Modal';
import { FormField } from '@/core/components/ui/FormField';
import { fieldInputStyle } from '@/core/utils/formStyles';
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

export function ChangeMotoStatusModal({ moto, onClose, onUpdated }: { moto: Moto; onClose: () => void; onUpdated: () => void }) {
  const { success, error } = useToast();
  const [status, setStatus] = useState<MotoStatus>(moto.status);
  const { isLoading, execute } = useAsync(() => api.put(`/motos/${moto.id}`, { status }));

  const handleSubmit = async () => {
    const result = await execute();
    if (result !== undefined) {
      success('Status updated');
      onUpdated();
      onClose();
    } else {
      error('Failed to update status');
    }
  };

  return (
    <Modal
      title="Change status"
      subtitle={`${moto.brand} ${moto.model} · ${moto.plate}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" size="md" style={{ flex: 1 }} onClick={onClose}>Cancel</Button>
          <Button size="md" style={{ flex: 1 }} disabled={status === moto.status || isLoading} onClick={handleSubmit}>
            {isLoading ? 'Saving…' : 'Save'}
          </Button>
        </>
      }
    >
      <FormField label="Status">
        <select style={fieldInputStyle} value={status} onChange={e => setStatus(e.target.value as MotoStatus)}>
          {STATUS_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
        </select>
      </FormField>
    </Modal>
  );
}
