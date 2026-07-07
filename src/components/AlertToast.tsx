import { useState, useEffect } from 'react';

interface ToastAlert {
  id: number;
  message: string;
}

let toastIdCounter = 0;
let addToastCallback: ((message: string) => void) | null = null;

// Función global exportable para lanzar notificaciones de alerta
export function triggerAlert(message: string) {
  if (addToastCallback) {
    addToastCallback(message);
  }
}

export function AlertToastContainer() {
  const [toasts, setToasts] = useState<ToastAlert[]>([]);

  useEffect(() => {
    addToastCallback = (msg) => {
      const id = toastIdCounter++;
      setToasts((prev) => [...prev, { id, message: msg }]);
      
      // Auto desvanecer individualmente después de 6 segundos
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 6000);
    };
    return () => {
      addToastCallback = null;
    };
  }, []);

  return (
    <div className="alert-toast-container" style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      pointerEvents: 'none'
    }}>
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          className="alert-toast-item"
          style={{
            pointerEvents: 'auto',
            background: 'rgba(239, 68, 68, 0.12)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            boxShadow: '0 10px 30px rgba(239, 68, 68, 0.15)',
            borderRadius: '12px',
            padding: '14px 18px',
            color: '#f3f4f6',
            maxWidth: '380px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            animation: 'toast-slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both'
          }}
        >
          {/* Triángulo de alerta lineal SVG */}
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#ef4444" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ flexShrink: 0, marginTop: '2px' }}
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              En Desarrollo
            </span>
            <p style={{ fontSize: '12px', lineHeight: '1.5', color: '#d1d5db', margin: 0 }}>
              {toast.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
