import { useState, type ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function CollapsibleSection({ icon, title, defaultOpen = true, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`panel-section${open ? '' : ' collapsed'}`}>
      <button type="button" className="panel-section-title" onClick={() => setOpen((v) => !v)}>
        {icon}
        {title}
        <span className="section-line" />
        <span className="section-arrow">▾</span>
      </button>
      <div className="panel-section-body">{children}</div>
    </div>
  );
}
