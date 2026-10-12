import React, { useEffect, useRef } from 'react';
import { usePresentationStore } from '../stores/presentationStore';

type MenuItem = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  divider?: boolean;
};

export function ContextMenu({
  open,
  x,
  y,
  onClose,
}: {
  open: boolean;
  x: number;
  y: number;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const {
    selectedElementId,
    copySelected,
    cutSelected,
    pasteElement,
    hasClipboard,
    removeElement,
  } = usePresentationStore((s) => ({
    selectedElementId: s.selectedElementId,
    copySelected: s.copySelected,
    cutSelected: s.cutSelected,
    pasteElement: s.pasteElement,
    hasClipboard: s.hasClipboard,
    removeElement: s.removeElement,
  }));

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const hasSel = !!selectedElementId;

  const items: (MenuItem | { divider: true })[] = [];

  if (hasSel) {
    items.push({ label: 'Cut', onClick: () => { cutSelected(); onClose(); } });
    items.push({ label: 'Copy', onClick: () => { copySelected(); onClose(); } });
  }
  items.push({ label: 'Paste', onClick: () => { pasteElement(); onClose(); }, disabled: !hasClipboard() });

  if (hasSel) {
    items.push({ divider: true });
    items.push({ label: 'Delete', onClick: () => { if (selectedElementId) removeElement(selectedElementId); onClose(); } });
  }

  const left = Math.min(x, window.innerWidth - 200);
  const top = Math.min(y, window.innerHeight - 220);

  return (
    <div
      ref={ref}
      className='fixed z-[9999] bg-white border border-[#d1d1d1] shadow-lg rounded py-1 min-w-[180px]'
      style={{ left, top }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((it, i) =>
        'divider' in it ? (
          <div key={i} className='h-px bg-[#e1e1e1] my-1' />
        ) : (
          <button
            key={i}
            className='w-full text-left px-3 py-1.5 text-sm hover:bg-[#e6f2ff] disabled:opacity-40 disabled:pointer-events-none'
            onClick={it.onClick}
            disabled={it.disabled}
          >
            {it.label}
          </button>
        )
      )}
    </div>
  );
}
