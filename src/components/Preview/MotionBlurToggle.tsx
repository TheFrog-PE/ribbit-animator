import type { AnimConfig } from '../../types';
import { MotionBlurIcon } from '../icons';

interface Props {
  config: AnimConfig;
  onChange: (patch: Partial<AnimConfig>) => void;
}

export function MotionBlurToggle({ config, onChange }: Props) {
  return (
    <div className="filter-floating-bar" title="Desenfoque de Movimiento (Motion Blur)" onClick={(e) => e.stopPropagation()}>
      <button
        className={`preset-dot preset-dot-mblur${config.motionBlurEnabled ? ' active' : ''}`}
        title="Activar/Desactivar Desenfoque de Movimiento"
        onClick={() => onChange({ motionBlurEnabled: !config.motionBlurEnabled })}
      >
        <MotionBlurIcon />
      </button>
    </div>
  );
}
