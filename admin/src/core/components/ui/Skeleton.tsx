import type { CSSProperties } from 'react';

export function Skeleton({ style, className }: { style?: CSSProperties; className?: string }) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--border-2)',
        borderRadius: 6,
        animation: 'skeleton-pulse 1.4s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

/** Skeleton rows matching a table's CSS grid, for use in place of a loading text row. */
export function TableSkeleton({
  gridTemplateColumns,
  columns,
  rows = 6,
  rowPadding = '12px 20px',
}: {
  gridTemplateColumns: string;
  columns: number;
  rows?: number;
  rowPadding?: string;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          style={{
            display: 'grid', gridTemplateColumns,
            gap: 12, alignItems: 'center', padding: rowPadding,
            borderTop: '1px solid var(--border-2)',
          }}
        >
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} style={{ height: 12, width: c === 0 ? '70%' : '50%' }} />
          ))}
        </div>
      ))}
    </>
  );
}

export function CardSkeleton({ style }: { style?: CSSProperties }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 16, boxShadow: 'var(--shadow)', padding: '17px 18px',
      display: 'flex', flexDirection: 'column', gap: 10, ...style,
    }}>
      <Skeleton style={{ height: 10, width: '55%' }} />
      <Skeleton style={{ height: 26, width: '65%' }} />
      <Skeleton style={{ height: 28, width: '100%', marginTop: 4 }} />
    </div>
  );
}
