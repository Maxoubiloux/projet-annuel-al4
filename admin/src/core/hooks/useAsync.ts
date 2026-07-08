import { useCallback, useReducer } from 'react';

type AsyncState<T> =
  | { status: 'idle'; data: undefined; error: undefined; isLoading: false }
  | { status: 'loading'; data: undefined; error: undefined; isLoading: true }
  | { status: 'success'; data: T; error: undefined; isLoading: false }
  | { status: 'error'; data: undefined; error: Error; isLoading: false };

type Action<T> =
  | { type: 'LOADING' }
  | { type: 'SUCCESS'; data: T }
  | { type: 'ERROR'; error: Error }
  | { type: 'RESET' };

function reducer<T>(state: AsyncState<T>, action: Action<T>): AsyncState<T> {
  switch (action.type) {
    case 'LOADING':
      return { status: 'loading', data: undefined, error: undefined, isLoading: true };
    case 'SUCCESS':
      return { status: 'success', data: action.data, error: undefined, isLoading: false };
    case 'ERROR':
      return { status: 'error', data: undefined, error: action.error, isLoading: false };
    case 'RESET':
      return { status: 'idle', data: undefined, error: undefined, isLoading: false };
    default:
      return state;
  }
}

const IDLE = { status: 'idle', data: undefined, error: undefined, isLoading: false } as const;

export function useAsync<T, Args extends unknown[] = []>(
  fn: (...args: Args) => Promise<T>,
) {
  const [state, dispatch] = useReducer(reducer<T>, IDLE as AsyncState<T>);

  const execute = useCallback(
    async (...args: Args): Promise<T | undefined> => {
      dispatch({ type: 'LOADING' });
      try {
        const data = await fn(...args);
        dispatch({ type: 'SUCCESS', data });
        return data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        dispatch({ type: 'ERROR', error });
        return undefined;
      }
    },
    [fn],
  );

  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return { ...state, execute, reset };
}
