import type { AnimConfig } from '../../types';
import { ExportIcon, ExportAllIcon } from '../icons';
import { TextEditSection } from './TextEditSection';
import { SvgTextNodesSection, type SvgTextNodeView } from './SvgTextNodesSection';
import { TimingSection } from './TimingSection';
import { VisualEffectsSection } from './VisualEffectsSection';
import { ImageEditSection } from './ImageEditSection';

interface Props {
  config: AnimConfig;
  onChange: (patch: Partial<AnimConfig>) => void;
  textNodes: SvgTextNodeView[];
  onTextNodeChange: (id: string, value: string) => void;
  onExport: () => void;
  onExportAll: () => void;
  exportDisabled: boolean;
  exportAllDisabled: boolean;
}

export function ControlPanel({
  config,
  onChange,
  textNodes,
  onTextNodeChange,
  onExport,
  onExportAll,
  exportDisabled,
  exportAllDisabled,
}: Props) {
  return (
    <div className="control-panel">
      {/* Selector de pestañas premium en capsulas glassmorphism */}
      <div className="control-panel-tabs" style={{ 
        display: 'flex', 
        padding: '12px 16px', 
        gap: '8px', 
        background: 'rgba(15, 18, 30, 0.4)',
        borderBottom: '1px solid var(--glass-border)' 
      }}>
        <button
          className={`tab-btn ${!config.imageModeActive ? 'active' : ''}`}
          style={{
            flex: 1,
            padding: '10px 14px',
            background: !config.imageModeActive 
              ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.22), rgba(99, 102, 241, 0.08))' 
              : 'rgba(255, 255, 255, 0.02)',
            border: '1px solid',
            borderColor: !config.imageModeActive ? 'rgba(99, 102, 241, 0.35)' : 'rgba(255, 255, 255, 0.05)',
            borderRadius: '10px',
            color: !config.imageModeActive ? '#ffffff' : 'var(--text-sub)',
            fontFamily: 'var(--font-title)',
            fontWeight: 600,
            fontSize: '12px',
            letterSpacing: '0.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: !config.imageModeActive ? '0 4px 15px rgba(99, 102, 241, 0.15)' : 'none',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onClick={() => onChange({ imageModeActive: false })}
        >
          {/* Icono T (Texto) en contorno/trazos */}
          <svg viewBox="0 0 24 24" style={{ 
            width: 15, 
            height: 15, 
            stroke: !config.imageModeActive ? '#a5b4fc' : 'var(--text-sub)', 
            strokeWidth: 2, 
            fill: 'none' 
          }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M12 6v14m-5 0h10" />
          </svg>
          MODO TEXTO
        </button>
        <button
          className={`tab-btn ${config.imageModeActive ? 'active' : ''}`}
          style={{
            flex: 1,
            padding: '10px 14px',
            background: config.imageModeActive 
              ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.22), rgba(99, 102, 241, 0.08))' 
              : 'rgba(255, 255, 255, 0.02)',
            border: '1px solid',
            borderColor: config.imageModeActive ? 'rgba(99, 102, 241, 0.35)' : 'rgba(255, 255, 255, 0.05)',
            borderRadius: '10px',
            color: config.imageModeActive ? '#ffffff' : 'var(--text-sub)',
            fontFamily: 'var(--font-title)',
            fontWeight: 600,
            fontSize: '12px',
            letterSpacing: '0.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: config.imageModeActive ? '0 4px 15px rgba(99, 102, 241, 0.15)' : 'none',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onClick={() => onChange({ imageModeActive: true })}
        >
          {/* Icono Imagen en contorno/trazos */}
          <svg viewBox="0 0 24 24" style={{ 
            width: 15, 
            height: 15, 
            stroke: config.imageModeActive ? '#a5b4fc' : 'var(--text-sub)', 
            strokeWidth: 2, 
            fill: 'none' 
          }}>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="8.5" cy="8.5" r="1.5" stroke="none" fill="currentColor" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
          </svg>
          MODO IMAGEN
        </button>
      </div>

      <div className="control-panel-scroll">
        {!config.imageModeActive ? (
          <>
            <SvgTextNodesSection textNodes={textNodes} onTextNodeChange={onTextNodeChange} />
            <TextEditSection config={config} onChange={onChange} />
          </>
        ) : (
          <ImageEditSection config={config} onChange={onChange} />
        )}
        <TimingSection config={config} onChange={onChange} />
        <VisualEffectsSection config={config} onChange={onChange} />
      </div>
      <div className="control-panel-footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button className="btn" style={{ width: '100%' }} onClick={onExport} disabled={exportDisabled}>
          <ExportIcon style={{ width: 18, height: 18, fill: 'white' }} />
          Exportar AVI Activo
        </button>
        <button className="btn btn-secondary" style={{ width: '100%', gap: '10px' }} onClick={onExportAll} disabled={exportAllDisabled}>
          <ExportAllIcon style={{ width: 18, height: 18, fill: 'white' }} />
          Exportar Todos los AVI
        </button>
      </div>
    </div>
  );
}
