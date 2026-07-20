import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface DropdownMenuProps {
  anchorRect: DOMRect;
  onClose: () => void;
  minWidth?: number;
  children: ReactNode;
}

const GAP = 6;

export function DropdownMenu({ anchorRect, onClose, minWidth = 160, children }: DropdownMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({
    position: 'fixed', visibility: 'hidden',
    top: anchorRect.bottom + GAP, right: window.innerWidth - anchorRect.right,
  });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const height = el.offsetHeight;
    const spaceBelow = window.innerHeight - anchorRect.bottom;
    const openUp = spaceBelow < height + GAP && anchorRect.top > height + GAP;
    setStyle({
      position: 'fixed',
      right: window.innerWidth - anchorRect.right,
      ...(openUp ? { bottom: window.innerHeight - anchorRect.top + GAP } : { top: anchorRect.bottom + GAP }),
    });
  }, [anchorRect]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', handleClick);
    window.addEventListener('scroll', onClose, true);
    window.addEventListener('resize', onClose);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      window.removeEventListener('scroll', onClose, true);
      window.removeEventListener('resize', onClose);
    };
  }, [onClose]);

  return createPortal(
    <div ref={ref} style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 10, boxShadow: 'var(--shadow)',
      minWidth, padding: 5, zIndex: 1000,
      ...style,
    }}>
      {children}
    </div>,
    document.body
  );
}

export function DropdownMenuItem({ onClick, color = 'var(--ink)', children }: { onClick: () => void; color?: string; children: ReactNode }) {
  return (
    <button onClick={onClick} style={{
      display: 'block', width: '100%', padding: '7px 10px',
      textAlign: 'left', fontSize: 12.5, color,
      border: 'none', background: 'transparent', borderRadius: 7, cursor: 'pointer',
    }}>{children}</button>
  );
}
