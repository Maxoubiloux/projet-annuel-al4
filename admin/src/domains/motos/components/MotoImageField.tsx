import { useRef } from 'react';
import { Upload } from 'lucide-react';
import { FormField } from '@/core/components/ui/FormField';
import { Button } from '@/core/components/ui/Button';
import { useAsync } from '@/core/hooks/useAsync';
import { useToast } from '@/core/components/ToastProvider';
import { api } from '@/core/services/api';

interface UploadResponse {
  success: boolean;
  data: { url: string };
}

export function MotoImageField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { error } = useToast();
  const { isLoading, execute } = useAsync((file: File) =>
    api.upload<UploadResponse>('/motos/upload-image', file),
  );

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const result = await execute(file);
    if (result !== undefined) {
      onChange(result.data.url);
    } else {
      error('Failed to upload image');
    }
  };

  return (
    <FormField label="Photo">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {value && (
          <img
            src={value}
            alt="Motorcycle preview"
            style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }}
          />
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files?.[0])}
        />
        <Button
          type="button"
          variant="secondary"
          size="md"
          disabled={isLoading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload size={14} strokeWidth={1.6} />
          {isLoading ? 'Uploading…' : value ? 'Replace photo' : 'Upload photo'}
        </Button>
      </div>
    </FormField>
  );
}
