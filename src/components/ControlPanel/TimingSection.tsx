import type { AnimConfig, EasingType } from '../../types';
import { ClockIcon } from '../icons';
import { CollapsibleSection } from './CollapsibleSection';
import { ElasticSlider } from '../ElasticSlider';
import { CustomSelect } from '../CustomSelect';

const EASING_OPTIONS = [
  { value: 'backOut',    label: 'Back Out — Resorte Elegante' },
  { value: 'elasticOut', label: 'Elastic Out — Efecto Elástico' },
  { value: 'easeOut',    label: 'Ease Out — Suave Decreciente' },
  { value: 'bounceOut',  label: 'Bounce Out — Rebote Divertido' },
  { value: 'easeInOut',  label: 'Ease In-Out — Aceleración Suave' },
  { value: 'circOut',    label: 'Circ Out — Curva Circular' },
];

interface Props {
  config: AnimConfig;
  onChange: (patch: Partial<AnimConfig>) => void;
}

export function TimingSection({ config, onChange }: Props) {
  return (
    <CollapsibleSection icon={<ClockIcon />} title="Parámetros de Entrada">
      <div className="control-group">
        <div className="control-label">
          <span>Duración por Letra</span>
          <span className="control-val" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
            <input
              type="number"
              min="0"
              max="10"
              step="0.05"
              value={config.duration}
              onChange={(e) => onChange({ duration: Math.max(0, parseFloat(e.target.value) || 0) })}
              style={{
                width: '46px',
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
            s
          </span>
        </div>
        <ElasticSlider
          min={0.0}
          max={2.0}
          step={0.05}
          value={config.duration}
          onChange={(v) => onChange({ duration: v })}
        />
      </div>

      <div className="control-group">
        <div className="control-label">
          <span>Retraso de Entrada (Stagger)</span>
          <span className="control-val" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
            <input
              type="number"
              min="0"
              max="5"
              step="0.01"
              value={config.stagger}
              onChange={(e) => onChange({ stagger: Math.max(0, parseFloat(e.target.value) || 0) })}
              style={{
                width: '46px',
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
            s
          </span>
        </div>
        <ElasticSlider
          min={0.0}
          max={0.5}
          step={0.01}
          value={config.stagger}
          onChange={(v) => onChange({ stagger: v })}
        />
      </div>

      <div className="control-group">
        <div className="control-label">
          <span>Suavidad (Curva Easing)</span>
        </div>
        <CustomSelect
          value={config.easing}
          options={EASING_OPTIONS}
          onChange={(v) => onChange({ easing: v as EasingType })}
        />
      </div>
    </CollapsibleSection>
  );
}

