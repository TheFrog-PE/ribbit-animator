import type { AnimConfig, EasingType, RevealMode } from '../../types';
import { PRESETS } from '../../types';
import { getComplementaryColor } from '../../lib/colorUtils';
import { ResetIcon, DiceIcon, CopyIcon, PasteIcon } from '../icons';

interface Props {
  config: AnimConfig;
  onChange: (patch: Partial<AnimConfig>) => void;
  originalColors: { outline: string; fill: string } | null;
}

const EASINGS: EasingType[] = ['backOut', 'elasticOut', 'easeOut', 'bounceOut', 'easeInOut', 'circOut'];
const REVEALS: RevealMode[] = ['none', 'wipeUp', 'wipeDown', 'wipeLeft', 'wipeRight', 'liquidRise'];

export function PresetsFloatingBar({ config, onChange, originalColors }: Props) {
  const randomizeAnimation = () => {
    const duration = parseFloat((0.4 + Math.random() * 0.8).toFixed(2));
    const stagger = parseFloat((0.02 + Math.random() * 0.10).toFixed(3));
    const easing = EASINGS[Math.floor(Math.random() * EASINGS.length)];
    const revealMode = REVEALS[Math.floor(Math.random() * REVEALS.length)];
    const offsetX = Math.floor(-150 + Math.random() * 300);
    const offsetY = Math.floor(-120 + Math.random() * 240);
    const startScale = parseFloat((0.2 + Math.random() * 1.0).toFixed(2));
    const startOpacity = parseFloat((Math.random() * 0.5).toFixed(2));
    const startRotation = Math.floor(-90 + Math.random() * 180);
    const fillOffset = parseFloat((0.1 + Math.random() * 0.6).toFixed(2));
    const writeOn = Math.random() > 0.5;

    onChange({
      duration,
      stagger,
      easing,
      revealMode,
      offsetX,
      offsetY,
      startScale,
      startOpacity,
      startRotation,
      fillOffset,
      writeOn
    });
  };

  const copyConfig = () => {
    const copyData = {
      duration: config.duration,
      stagger: config.stagger,
      easing: config.easing,
      revealMode: config.revealMode,
      offsetX: config.offsetX,
      offsetY: config.offsetY,
      startScale: config.startScale,
      startOpacity: config.startOpacity,
      startRotation: config.startRotation,
      fillOffset: config.fillOffset,
      writeOn: config.writeOn,
    };
    localStorage.setItem('ribbit_copied_config', JSON.stringify(copyData));
  };

  const pasteConfig = () => {
    const stored = localStorage.getItem('ribbit_copied_config');
    if (stored) {
      try {
        const parsedData = JSON.parse(stored);
        onChange(parsedData);
      } catch (err) {
        console.error('Error al pegar los parámetros de animación:', err);
      }
    }
  };

  return (
    <>
      {/* 1. Paleta de colores: al costado izquierdo (vertical) */}
      <div className="presets-floating-bar-colors" title="Colores Preestablecidos" onClick={(e) => e.stopPropagation()}>
        {PRESETS.map((preset) => {
          const active =
            config.outlineColor === preset.outlineColor &&
            config.fillColor === getComplementaryColor(preset.outlineColor);
          return (
            <button
              key={preset.id}
              className={`preset-dot${active ? ' active' : ''}`}
              style={{ background: preset.swatch }}
              title={preset.name}
              onClick={() =>
                onChange({
                  outlineColor: preset.outlineColor,
                  fillColor: getComplementaryColor(preset.outlineColor),
                })
              }
            />
          );
        })}

        <div className="preset-divider-vertical" />

        <div className="color-picker-wrapper" title="Color Silueta (Outline)">
          <input
            type="color"
            value={config.outlineColor}
            onChange={(e) =>
              onChange({ outlineColor: e.target.value, fillColor: getComplementaryColor(e.target.value) })
            }
          />
        </div>
        <div className="color-picker-wrapper" title="Color Relleno (Fill)">
          <input type="color" value={config.fillColor} onChange={(e) => onChange({ fillColor: e.target.value })} />
        </div>

        <div className="preset-divider-vertical" />

        <button
          className="preset-dot preset-dot-reset"
          title="Restablecer Colores Originales"
          disabled={!originalColors}
          onClick={() =>
            originalColors && onChange({ outlineColor: originalColors.outline, fillColor: originalColors.fill })
          }
        >
          <ResetIcon />
        </button>
      </div>

      {/* 2. Herramientas de utilidad (Aleatorio, Copiar, Pegar): abajo al centro (horizontal) */}
      <div className="presets-floating-bar-tools" title="Herramientas de Animación" onClick={(e) => e.stopPropagation()}>
        <button
          className="preset-dot preset-dot-dice"
          title="Generar Animación Aleatoria"
          onClick={randomizeAnimation}
        >
          <DiceIcon />
        </button>

        <div className="preset-divider-horizontal" />

        <button
          className="preset-dot preset-dot-copy"
          title="Copiar Ajustes de Animación"
          onClick={copyConfig}
        >
          <CopyIcon />
        </button>

        <button
          className="preset-dot preset-dot-paste"
          title="Pegar Ajustes de Animación"
          onClick={pasteConfig}
        >
          <PasteIcon />
        </button>
      </div>
    </>
  );
}
