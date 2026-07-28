import type { CSSProperties } from 'react';

export const fieldInputStyle: CSSProperties = {
  width: '100%', height: 36, padding: '0 12px', boxSizing: 'border-box',
  background: 'var(--surface-2)', border: '1px solid var(--border)',
  borderRadius: 9, fontSize: 13, color: 'var(--ink)', outline: 'none',
  fontFamily: "'Geist',system-ui,sans-serif",
};

export const fieldTextareaStyle: CSSProperties = {
  ...fieldInputStyle,
  height: 'auto', minHeight: 72, padding: '8px 12px', resize: 'vertical',
};
