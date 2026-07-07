import type { AnimConfig } from '../../types';
import { ExportIcon } from '../icons';
import { CollapsibleSection } from './CollapsibleSection';
import { ElasticSlider } from '../ElasticSlider';
import { CustomSelect } from '../CustomSelect';

const FPS_OPTIONS = [
  { value: '30', label: '30 FPS — Estándar' },
  { value: '60', label: '60 FPS — Ultra Suave' },
];

const SCALE_OPTIONS = [
  { value: '1', label: '1x — Original' },
  { value: '2', label: '2x — Ultra Sharp' },
];

interface Props {
  config: AnimConfig;
  onChange: (patch: Partial<AnimConfig>) => void;
}

export function ExportSection({ config, onChange }: Props) {
  return (
    <CollapsibleSection icon={<ExportIcon />} title="Ajustes de Exportación">
      <div className="control-group">
        <div className="control-label">
          <span>Margen Vertical de Seguridad</span>
          <span className="control-val">{config.canvasPadding}px</span>
        </div>
        <ElasticSlider
          min={0}
          max={200}
          step={10}
          value={config.canvasPadding}
          onChange={(v) => onChange({ canvasPadding: v })}
        />
      </div>

      <div className="control-group">
        <div className="control-label">
          <span>Frame Rate (FPS)</span>
        </div>
        <CustomSelect
          value={String(config.fps)}
          options={FPS_OPTIONS}
          onChange={(v) => onChange({ fps: Number(v) })}
        />
      </div>

      <div className="control-group">
        <div className="control-label">
          <span>Resolución de Render</span>
        </div>
        <CustomSelect
          value={String(config.renderScale)}
          options={SCALE_OPTIONS}
          onChange={(v) => onChange({ renderScale: Number(v) })}
        />
      </div>
    </CollapsibleSection>
  );
}
