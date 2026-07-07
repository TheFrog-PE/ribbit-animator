import { useEffect, useState } from 'react';

interface Props {
  current: number;
  total: number;
}

const LYRICS = [
  "Ring ding ding daa baa",
  "Baa aramba baa bom baa barooumba",
  "Wh-wha-what's going on-on?",
  "Ding, ding",
  "This is the Crazy Frog",
  "Ding, ding",
  "Bem, bem",
  "Ring ding ding ding ding ding",
  "Ring ding ding ding bem bem bem",
  "Ring ding ding ding ding ding",
  "Ring ding ding ding baa baa",
  "Ring ding ding ding ding ding",
  "Ring ding ding ding bem bem bem",
  "Ring ding ding ding ding ding",
  "This is the Crazy Frog",
  "Breakdown",
  "Ding, ding",
  "Br-br-break it, br-break it",
  "Dum dum dumda dum dum dum",
  "Dum dum dumda dum dum dum",
  "Dum dum dumda dum dum dum",
  "Bem, bem",
  "Dum dum dumda dum dum dum",
  "Dum dum dumda dum dum dum",
  "Dum dum dumda dum dum dum",
  "This is the Crazy Frog",
  "A ram me ma bra ba bra bra rim bran",
  "Dran drra ma mababa baabeeeaaaaaaa",
  "Ding, ding",
  "This is the Crazy Frog",
  "Ding, ding",
  "Da, da",
  "Ring ding ding ding ding ding",
  "Ring ding ding ding bem bem bem",
  "Ring ding ding ding ding ding",
  "Ring ding ding ding baa baa",
  "Ring ding ding ding ding ding",
  "Ring ding ding ding bem bem bem",
  "Ring ding ding ding ding ding",
  "This is the Crazy Frog",
  "Ding, ding",
  "Br-br-break it, br-break it",
  "Dum dum dumda dum dum dum",
  "Dum dum dumda dum dum dum",
  "Dum dum dumda dum dum dum",
  "Bem, bem",
  "Dum dum dumda dum dum dum",
  "Dum dum dumda dum dum dum",
  "Dum dum dumda dum dum dum",
  "This is the Crazy Frog"
];

export function ProgressOverlay({ current, total }: Props) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  const [lyricIndex, setLyricIndex] = useState(0);

  // Cambiar la línea de la canción de Crazy Frog de forma dinámica durante la exportación
  useEffect(() => {
    const interval = setInterval(() => {
      setLyricIndex((prev) => (prev + 1) % LYRICS.length);
    }, 1500); // cambia de frase cada 1.5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="progress-overlay">
      <div className="progress-box animate-pulse-border">
        <div className="progress-title">Se está exportando tu vaina</div>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${pct}%` }} />
        </div>
        
        {/* Sección de la canción y los puntos rítmicos */}
        <div className="progress-status-container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginTop: '12px'
        }}>
          {/* Puntos rítmicos antes del texto */}
          <div className="rhythmic-dots">
            <span className="dot dot-1"></span>
            <span className="dot dot-2"></span>
            <span className="dot dot-3"></span>
          </div>

          <div className="progress-status-text" style={{ 
            color: '#f3f4f6', // Letra en blanco/gris claro normal, no cursiva
            fontFamily: 'var(--font-body), sans-serif',
            fontSize: '13px',
            fontWeight: '600',
            letterSpacing: '0.3px',
            textTransform: 'uppercase'
          }}>
            {LYRICS[lyricIndex]}
          </div>

          {/* Porcentaje al final */}
          <span style={{ 
            color: '#59B99D', 
            fontWeight: '750', 
            fontSize: '13px',
            fontFamily: 'monospace'
          }}>
            {pct}%
          </span>
        </div>
      </div>
    </div>
  );
}
