import { useMemo, useState } from 'react';
import type { ZodType } from 'zod';

/**
 * Validates `data` against a Zod schema on every render, but only surfaces
 * field errors once the form has been touched (i.e. after a submit attempt) —
 * avoids showing red errors before the user has interacted with the form.
 */
export function useFormValidation<T>(schema: ZodType<T>, data: T) {
  const [touched, setTouched] = useState(false);

  const result = useMemo(() => schema.safeParse(data), [schema, data]);

  const errors = useMemo(() => {
    const out: Partial<Record<keyof T, string>> = {};
    if (result.success || !touched) return out;
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof T | undefined;
      if (key !== undefined && !(key in out)) out[key] = issue.message;
    }
    return out;
  }, [result, touched]);

  return {
    isValid: result.success,
    errors,
    touch: () => setTouched(true),
  };
}
