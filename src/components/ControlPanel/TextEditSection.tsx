import type { AnimConfig } from '../../types';
import { TextIcon, TextEditIcon } from '../icons';
import { FONT_OPTIONS } from './fontOptions';
import { ElasticSlider } from '../ElasticSlider';
import { CustomSelect } from '../CustomSelect';
import { triggerAlert } from '../AlertToast';

interface Props {
  config: AnimConfig;
  onChange: (patch: Partial<AnimConfig>) => void;
}

export function TextEditSection({ config, onChange }: Props) {
  return (
    <>
      <div className="panel-section">
        <div className="panel-section-title" style={{ cursor: 'default' }}>
          <TextIcon />
          Opciones de Texto
          <span className="section-line" />
        </div>
        <div 
          className="checkbox-container" 
          onClick={(e) => {
            e.preventDefault();
            triggerAlert("Oe mano, aún lo estoy trabajando, espera tantito, más bien si tienes alguna idea escríbemela por las redes sociales, ahi nos vidrios");
          }}
          style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}
        >
          <span className="checkbox-label" style={{ fontWeight: 600, color: '#a5b4fc', opacity: 0.7 }}>
            Activar Edición de Texto
          </span>
          <span className="switch" style={{ opacity: 0.6 }}>
            <input
              type="checkbox"
              checked={false}
              readOnly
            />
            <span className="slider" />
          </span>
        </div>
      </div>

      {config.textEditActive && (
        <div
          className="panel-section"
          style={{
            background: 'rgba(79, 70, 229, 0.05)',
            border: '1px solid rgba(79, 70, 229, 0.15)',
            padding: 16,
            borderRadius: 12,
            gap: 14,
          }}
        >
          <div className="panel-section-title" style={{ color: '#a5b4fc', cursor: 'default' }}>
            <TextEditIcon />
            Editor de Texto SVG
            <span className="section-line" />
          </div>

          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 12 }}>
            <div className="control-group">
              <label className="control-label">Texto Línea 1 (Arriba)</label>
              <input
                type="text"
                value={config.line1}
                onChange={(e) => onChange({ line1: e.target.value })}
              />
            </div>
            <div className="control-group" style={{ marginTop: 6 }}>
              <label className="control-label" style={{ fontSize: 11 }}>
                Tipografía Línea 1
              </label>
            <CustomSelect
              value={config.fontFamily1}
              options={FONT_OPTIONS}
              onChange={(v) => onChange({ fontFamily1: v })}
            />
            </div>
            <div className="control-group" style={{ marginTop: 6 }}>
              <div className="control-label">
                <span>Tamaño Fuente 1</span>
                <span className="control-val">{config.fontSize1}px</span>
              </div>
              <ElasticSlider
                min={20}
                max={100}
                step={1}
                value={config.fontSize1}
                onChange={(v) => onChange({ fontSize1: v })}
              />
            </div>
            <div className="control-group" style={{ marginTop: 6 }}>
              <div className="control-label">
                <span>Posición Y Línea 1</span>
                <span className="control-val">{config.yPos1}px</span>
              </div>
              <ElasticSlider
                min={20}
                max={240}
                step={1}
                value={config.yPos1}
                onChange={(v) => onChange({ yPos1: v })}
              />
            </div>
          </div>

          <div>
            <div className="control-group">
              <label className="control-label">Texto Línea 2 (Abajo)</label>
              <input
                type="text"
                value={config.line2}
                onChange={(e) => onChange({ line2: e.target.value })}
              />
            </div>
            <div className="control-group" style={{ marginTop: 6 }}>
              <label className="control-label" style={{ fontSize: 11 }}>
                Tipografía Línea 2
              </label>
            <CustomSelect
              value={config.fontFamily2}
              options={FONT_OPTIONS}
              onChange={(v) => onChange({ fontFamily2: v })}
            />
            </div>
            <div className="control-group" style={{ marginTop: 6 }}>
              <div className="control-label">
                <span>Tamaño Fuente 2</span>
                <span className="control-val">{config.fontSize2}px</span>
              </div>
              <ElasticSlider
                min={30}
                max={150}
                step={1}
                value={config.fontSize2}
                onChange={(v) => onChange({ fontSize2: v })}
              />
            </div>
            <div className="control-group" style={{ marginTop: 6 }}>
              <div className="control-label">
                <span>Posición Y Línea 2</span>
                <span className="control-val">{config.yPos2}px</span>
              </div>
              <ElasticSlider
                min={50}
                max={240}
                step={1}
                value={config.yPos2}
                onChange={(v) => onChange({ yPos2: v })}
              />
            </div>
          </div>

          <div
            className="control-group"
            style={{ marginTop: 6, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12 }}
          >
            <div className="control-label">
              <span>Espaciado de Letras (Tracking)</span>
              <span className="control-val">{config.letterSpacing}px</span>
            </div>
            <ElasticSlider
              min={-10}
              max={30}
              step={1}
              value={config.letterSpacing}
              onChange={(v) => onChange({ letterSpacing: v })}
            />
          </div>
        </div>
      )}
    </>
  );
}
