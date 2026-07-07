import type { AnimConfig, RevealMode } from '../../types';
import { EffectsIcon } from '../icons';
import { CollapsibleSection } from './CollapsibleSection';
import { ElasticSlider } from '../ElasticSlider';
import { CustomSelect } from '../CustomSelect';

const REVEAL_OPTIONS = [
  { value: 'none',       label: 'Sin Revelado' },
  { value: 'wipeUp',     label: 'Barrido Ascendente ↑' },
  { value: 'wipeDown',   label: 'Barrido Descendente ↓' },
  { value: 'wipeLeft',   label: 'Barrido Izquierda ←' },
  { value: 'wipeRight',  label: 'Barrido Derecha →' },
  { value: 'liquidRise', label: 'Relleno Líquido 🌊' },
];

interface Props {
  config: AnimConfig;
  onChange: (patch: Partial<AnimConfig>) => void;
}

export function VisualEffectsSection({ config, onChange }: Props) {
  return (
    <CollapsibleSection icon={<EffectsIcon />} title="Efectos Visuales">
      <div className="control-group">
        <div className="control-label">
          <span>Desplazamiento Horizontal (Slide X)</span>
          <span className="control-val">{config.offsetX}px</span>
        </div>
        <ElasticSlider
          min={-200}
          max={200}
          step={10}
          value={config.offsetX}
          onChange={(v) => onChange({ offsetX: v })}
        />
      </div>

      <div className="control-group">
        <div className="control-label">
          <span>Desplazamiento Vertical (Slide Y)</span>
          <span className="control-val">{config.offsetY}px</span>
        </div>
        <ElasticSlider
          min={-200}
          max={200}
          step={10}
          value={config.offsetY}
          onChange={(v) => onChange({ offsetY: v })}
        />
      </div>

      <div className="control-group">
        <div className="control-label">
          <span>Escala Inicial</span>
          <span className="control-val">{config.startScale.toFixed(2)}x</span>
        </div>
        <ElasticSlider
          min={0}
          max={1.5}
          step={0.05}
          value={config.startScale}
          onChange={(v) => onChange({ startScale: v })}
        />
      </div>

      <div className="control-group">
        <div className="control-label">
          <span>Opacidad Inicial</span>
          <span className="control-val">{Math.round(config.startOpacity * 100)}%</span>
        </div>
        <ElasticSlider
          min={0}
          max={1}
          step={0.05}
          value={config.startOpacity}
          onChange={(v) => onChange({ startOpacity: v })}
        />
      </div>

      <div className="control-group">
        <div className="control-label">
          <span>Rotación Inicial</span>
          <span className="control-val">{config.startRotation}°</span>
        </div>
        <ElasticSlider
          min={-180}
          max={180}
          step={5}
          value={config.startRotation}
          onChange={(v) => onChange({ startRotation: v })}
        />
      </div>

      <label className="checkbox-container">
        <span className="checkbox-label">Efecto Write-on en Siluetas</span>
        <span className="switch">
          <input
            type="checkbox"
            checked={config.writeOn}
            onChange={(e) => onChange({ writeOn: e.target.checked })}
          />
          <span className="slider" />
        </span>
      </label>

      <label className="checkbox-container">
        <span className="checkbox-label">Habilitar Sombra (Drop Shadow)</span>
        <span className="switch">
          <input
            type="checkbox"
            checked={config.dropShadowEnabled}
            onChange={(e) => onChange({ dropShadowEnabled: e.target.checked })}
          />
          <span className="slider" />
        </span>
      </label>

      <div className="control-group">
        <div className="control-label">
          <span>Retraso del Relleno</span>
          <span className="control-val">{Math.round(config.fillOffset * 100)}%</span>
        </div>
        <ElasticSlider
          min={0}
          max={0.8}
          step={0.05}
          value={config.fillOffset}
          onChange={(v) => onChange({ fillOffset: v })}
        />
      </div>

      <div className="control-group">
        <div className="control-label">
          <span>Modo de Revelado</span>
        </div>
        <CustomSelect
          value={config.revealMode}
          options={REVEAL_OPTIONS}
          onChange={(v) => onChange({ revealMode: v as RevealMode })}
        />
      </div>
    </CollapsibleSection>
  );
}
