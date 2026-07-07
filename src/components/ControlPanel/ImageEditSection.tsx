import type { AnimConfig } from '../../types';
import { CollapsibleSection } from './CollapsibleSection';
import { ElasticSlider } from '../ElasticSlider';

interface Props {
  config: AnimConfig;
  onChange: (patch: Partial<AnimConfig>) => void;
}

export function ImageEditSection({ config, onChange }: Props) {
  return (
    <CollapsibleSection
      icon={
        <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'var(--accent)' }}>
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
        </svg>
      }
      title="Ajustes de Imagen"
    >
      <label className="checkbox-container">
        <span className="checkbox-label">Resplandor Luminoso (Glow)</span>
        <span className="switch">
          <input
            type="checkbox"
            checked={config.imageGlowEnabled}
            onChange={(e) => onChange({ imageGlowEnabled: e.target.checked })}
          />
          <span className="slider" />
        </span>
      </label>

      {config.imageGlowEnabled && (
        <>
          <div className="control-group">
            <div className="control-label">
              <span>Color de Resplandor</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '6px' }}>
              <div 
                className="color-picker-wrapper" 
                style={{ 
                  width: '38px', 
                  height: '38px', 
                  borderRadius: '10px', 
                  border: '1px solid rgba(255,255,255,0.15)',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                  overflow: 'hidden',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease'
                }}
              >
                <input
                  type="color"
                  value={config.imageGlowColor}
                  onChange={(e) => onChange({ imageGlowColor: e.target.value })}
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    left: '-6px',
                    width: '50px',
                    height: '50px',
                    padding: 0,
                    margin: 0,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <input
                  type="text"
                  defaultValue={config.imageGlowColor}
                  key={config.imageGlowColor}
                  placeholder="#ffffff"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value;
                      if (/^#[0-9A-F]{6}$/i.test(val)) {
                        onChange({ imageGlowColor: val });
                        (e.target as HTMLInputElement).blur();
                      }
                    }
                  }}
                  onBlur={(e) => {
                    const val = e.target.value;
                    if (/^#[0-9A-F]{6}$/i.test(val)) {
                      onChange({ imageGlowColor: val });
                    }
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#ffffff',
                    padding: '4px 8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    width: '80px',
                    outline: 'none',
                    textAlign: 'center'
                  }}
                />
                <span style={{ fontSize: '9px', color: 'var(--text-sub)', opacity: 0.7 }}>Presiona Enter para aplicar</span>
              </div>
            </div>
          </div>

          <div className="control-group">
            <div className="control-label">
              <span>Radio del Resplandor</span>
              <span className="control-val" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                <input
                  type="number"
                  min="0"
                  max="150"
                  value={config.imageGlowRadius}
                  onChange={(e) => onChange({ imageGlowRadius: Math.max(0, parseInt(e.target.value) || 0) })}
                  style={{
                    width: '42px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.2)',
                    color: 'var(--accent)',
                    textAlign: 'right',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    padding: '0 2px',
                    outline: 'none'
                  }}
                />
                px
              </span>
            </div>
            <ElasticSlider
              min={0}
              max={60}
              step={1}
              value={config.imageGlowRadius}
              onChange={(v) => onChange({ imageGlowRadius: v })}
            />
          </div>
        </>
      )}

      <div className="preset-divider" style={{ margin: '8px 0' }} />

      <label className="checkbox-container">
        <span className="checkbox-label">Efecto Movimiento 3D</span>
        <span className="switch">
          <input
            type="checkbox"
            checked={config.image3DEnabled}
            onChange={(e) => onChange({ image3DEnabled: e.target.checked })}
          />
          <span className="slider" />
        </span>
      </label>

      {config.image3DEnabled && (
        <div className="control-group">
          <div className="control-label">
            <span>Profundidad / Intensidad 3D</span>
            <span className="control-val" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
              <input
                type="number"
                min="0"
                max="90"
                value={config.image3DDepth}
                onChange={(e) => onChange({ image3DDepth: Math.max(0, parseInt(e.target.value) || 0) })}
                style={{
                  width: '42px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.2)',
                  color: 'var(--accent)',
                  textAlign: 'right',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  padding: '0 2px',
                  outline: 'none'
                }}
              />
              °
            </span>
          </div>
          <ElasticSlider
            min={0}
            max={35}
            step={1}
            value={config.image3DDepth}
            onChange={(v) => onChange({ image3DDepth: v })}
          />
        </div>
      )}

      <div className="preset-divider" style={{ margin: '8px 0' }} />

      <label className="checkbox-container">
        <span className="checkbox-label">Efecto Wiggle (Temblor)</span>
        <span className="switch">
          <input
            type="checkbox"
            checked={config.imageWiggleEnabled}
            onChange={(e) => onChange({ imageWiggleEnabled: e.target.checked })}
          />
          <span className="slider" />
        </span>
      </label>

      {config.imageWiggleEnabled && (
        <div className="control-group">
          <div className="control-label">
            <span>Intensidad de Vibración</span>
            <span className="control-val" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
              <input
                type="number"
                min="0"
                max="100"
                value={config.imageWiggleIntensity}
                onChange={(e) => onChange({ imageWiggleIntensity: Math.max(0, parseInt(e.target.value) || 0) })}
                style={{
                  width: '42px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.2)',
                  color: 'var(--accent)',
                  textAlign: 'right',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  padding: '0 2px',
                  outline: 'none'
                }}
              />
              px
            </span>
          </div>
          <ElasticSlider
            min={0}
            max={25}
            step={1}
            value={config.imageWiggleIntensity}
            onChange={(v) => onChange({ imageWiggleIntensity: v })}
          />
        </div>
      )}

      <div className="preset-divider" style={{ margin: '8px 0' }} />

      <label className="checkbox-container">
        <span className="checkbox-label">Destello de Brillo (Sheen)</span>
        <span className="switch">
          <input
            type="checkbox"
            checked={config.imageShineEnabled}
            onChange={(e) => onChange({ imageShineEnabled: e.target.checked })}
          />
          <span className="slider" />
        </span>
      </label>

      {config.imageShineEnabled && (
        <div className="control-group">
          <div className="control-label">
            <span>Color del Destello</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '6px' }}>
            <div 
              className="color-picker-wrapper" 
              style={{ 
                width: '38px', 
                height: '38px', 
                borderRadius: '10px', 
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
                transition: 'transform 0.15s ease'
              }}
            >
              <input
                type="color"
                value={config.imageShineColor}
                onChange={(e) => onChange({ imageShineColor: e.target.value })}
                style={{
                  position: 'absolute',
                  top: '-6px',
                  left: '-6px',
                  width: '50px',
                  height: '50px',
                  padding: 0,
                  margin: 0,
                  border: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <input
                type="text"
                defaultValue={config.imageShineColor}
                key={config.imageShineColor}
                placeholder="#ffffff"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value;
                    if (/^#[0-9A-F]{6}$/i.test(val)) {
                      onChange({ imageShineColor: val });
                      (e.target as HTMLInputElement).blur();
                    }
                  }
                }}
                onBlur={(e) => {
                  const val = e.target.value;
                  if (/^#[0-9A-F]{6}$/i.test(val)) {
                    onChange({ imageShineColor: val });
                  }
                }}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  padding: '4px 8px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  width: '80px',
                  outline: 'none',
                  textAlign: 'center'
                }}
              />
              <span style={{ fontSize: '9px', color: 'var(--text-sub)', opacity: 0.7 }}>Presiona Enter para aplicar</span>
            </div>
          </div>
        </div>
      )}
    </CollapsibleSection>
  );
}
