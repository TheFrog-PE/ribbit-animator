import { useState, useRef, useEffect, useId } from 'react';

interface Option {
  value: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
}

export function CustomSelect({ value, onChange, options }: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value) ?? options[0];

  // Cierra si el usuario hace clic fuera
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <div
      id={id}
      className={`cs-wrapper${open ? ' cs-open' : ''}`}
      ref={containerRef}
    >
      {/* Trigger */}
      <button
        type="button"
        className="cs-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="cs-trigger-label">{selected?.label}</span>
        <span className="cs-chevron">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <ul className="cs-dropdown" role="listbox">
          {options.map((opt) => (
            <li
              key={opt.value}
              className={`cs-option${opt.value === value ? ' cs-option-active' : ''}`}
              role="option"
              aria-selected={opt.value === value}
              onMouseDown={() => handleSelect(opt.value)}
            >
              {opt.value === value && (
                <span className="cs-check">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              )}
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
