import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/core/services/api';

export interface FetchMeta {
  total?: number;
  page?: number;
  limit?: number;
}

/** Envelope shape returned by the backend: { success, data, meta }. */
interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  meta?: FetchMeta;
}

function isEnvelope<T>(raw: unknown): raw is ApiEnvelope<T> {
  return !!raw && typeof raw === 'object' && 'success' in raw && 'data' in raw;
}

interface FetchState<T> {
  data: T | undefined;
  meta: FetchMeta | undefined;
  error: Error | undefined;
  isLoading: boolean;
}

interface UseFetchOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

interface UseFetchResult<T> extends FetchState<T> {
  refetch: () => void;
}

export function useFetch<T>(
  path: string | null,
  options: UseFetchOptions = {},
): UseFetchResult<T> {
  const { enabled = true, refetchInterval } = options;

  const [state, setState] = useState<FetchState<T>>({
    data: undefined,
    meta: undefined,
    error: undefined,
    isLoading: !!(path && enabled),
  });

  const abortRef = useRef<AbortController | null>(null);
  const pathRef = useRef(path);
  pathRef.current = path;

  const fetch_ = useCallback(() => {
    const currentPath = pathRef.current;
    if (!currentPath || !enabled) return;

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setState((s) => ({ ...s, isLoading: true, error: undefined }));

    api
      .get<T | ApiEnvelope<T>>(currentPath, ctrl.signal)
      .then((raw) => {
        if (ctrl.signal.aborted) return;
        if (isEnvelope<T>(raw)) {
          setState({ data: raw.data, meta: raw.meta, error: undefined, isLoading: false });
        } else {
          setState({ data: raw as T, meta: undefined, error: undefined, isLoading: false });
        }
      })
      .catch((err: Error) => {
        if (!ctrl.signal.aborted) {
          setState((s) => ({ ...s, error: err, isLoading: false }));
        }
      });
  }, [enabled]);

  useEffect(() => {
    if (!path || !enabled) {
      setState({ data: undefined, meta: undefined, error: undefined, isLoading: false });
      return;
    }
    fetch_();
    return () => {
      abortRef.current?.abort();
    };
  }, [path, enabled, fetch_]);

  useEffect(() => {
    if (!refetchInterval || !path || !enabled) return;
    const id = setInterval(fetch_, refetchInterval);
    return () => clearInterval(id);
  }, [refetchInterval, path, enabled, fetch_]);

  return { ...state, refetch: fetch_ };
}
