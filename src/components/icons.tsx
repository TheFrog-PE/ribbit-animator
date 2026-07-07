type IconProps = { style?: React.CSSProperties };

const base: React.CSSProperties = { width: 14, height: 14, flexShrink: 0 };

export function TextIcon({ style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base, fill: 'var(--accent)', ...style }}>
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  );
}

export function TextEditIcon({ style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base, fill: '#a5b4fc', ...style }}>
      <path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
    </svg>
  );
}

export function ClockIcon({ style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base, fill: 'var(--accent)', ...style }}>
      <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42A9 9 0 1 0 12 3a8.99 8.99 0 0 0 7.03 4.39zM12 19a7 7 0 1 1 0-14 7 7 0 0 1 0 14z" />
    </svg>
  );
}

export function EffectsIcon({ style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base, fill: 'var(--accent)', ...style }}>
      <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
    </svg>
  );
}

export function ExportIcon({ style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base, fill: 'var(--accent)', ...style }}>
      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
    </svg>
  );
}

export function ExportAllIcon({ style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base, fill: 'var(--accent)', ...style }}>
      {/* Icono de descarga múltiple (dos flechas apuntando hacia abajo con líneas base) */}
      <path d="M16 13h-3V3h-2v10H8l4 4 4-4zM4 17v2h16v-2H4zm12-4h3l-7 7-7-7h3V9h2v4h3v-4h2v4z" style={{ display: 'none' }} />
      <path d="M4 15h16v2H4zm0 4h16v2H4zm8-6l-4-4h3V3h2v6h3z" />
    </svg>
  );
}

export function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

export function ReplayIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
    </svg>
  );
}

export function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" />
    </svg>
  );
}

export function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  );
}

export function ResetIcon({ style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base, fill: 'currentColor', ...style }}>
      <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
    </svg>
  );
}

export function MotionBlurIcon({ style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base, fill: 'currentColor', ...style }}>
      <path d="M3 9h2v2H3V9zm0 4h2v2H3v-2zm0-8h2v2H3V5zm4 0h2v2H7V5zm0 14h2v2H7v-2zm0-6h10v2H7v-2zm0-4h10V7H7v2zm6 10h2v2h-2v-2zm4-8h2v2h-2v-2zm0-4h2v2h-2V9zm0 8h2v2h-2v-2zm0-12h2v2h-2V5z" />
    </svg>
  );
}

export function UploadCloudIcon() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: 48, height: 48, fill: 'rgba(255,255,255,0.15)' }}>
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm0 2l4 4h-4V4z" />
    </svg>
  );
}

export function DiceIcon({ style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base, fill: 'currentColor', ...style }}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="16" cy="8" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="8" cy="16" r="1.5" />
      <circle cx="16" cy="16" r="1.5" />
    </svg>
  );
}

export function CopyIcon({ style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base, fill: 'currentColor', ...style }}>
      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
    </svg>
  );
}

export function PasteIcon({ style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" style={{ ...base, fill: 'currentColor', ...style }}>
      <path d="M19 2h-4.18C14.4.84 13.3 0 12 0c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16z" />
    </svg>
  );
}
