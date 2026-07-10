import { useMemo, useRef, useState } from 'react';
import type { ZodType } from 'zod';

/**
 * Validates `data` against a Zod schema on every render, but only surfaces
 * field errors once the form has been touched — either explicitly (e.g. a
 * submit attempt) or implicitly, the first time `data` changes from the
 * value it had on mount. The implicit path matters because a submit button
 * disabled by `!isValid` can never be clicked to call `touch()`, which would
 * otherwise leave errors permanently hidden with no way to trigger them.
 */
export function useFormValidation<T>(schema: ZodType<T>, data: T) {
  const [touched, setTouched] = useState(false);
  const initialDataRef = useRef(data);
  const isDirty = data !== initialDataRef.current;

  const result = useMemo(() => schema.safeParse(data), [schema, data]);

  const errors = useMemo(() => {
    const out: Partial<Record<keyof T, string>> = {};
    if (result.success || !(touched || isDirty)) return out;
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof T | undefined;
      if (key !== undefined && !(key in out)) out[key] = issue.message;
    }
    return out;
  }, [result, touched, isDirty]);

  return {
    isValid: result.success,
    isDirty,
    errors,
    touch: () => setTouched(true),
  };
}
