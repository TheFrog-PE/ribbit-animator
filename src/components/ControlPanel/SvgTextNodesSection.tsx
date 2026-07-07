import { TextEditIcon } from '../icons';
import { CollapsibleSection } from './CollapsibleSection';

export interface SvgTextNodeView {
  id: string;
  value: string;
  originalText: string;
}

interface Props {
  textNodes: SvgTextNodeView[];
  onTextNodeChange: (id: string, value: string) => void;
}

export function SvgTextNodesSection({ textNodes, onTextNodeChange }: Props) {
  if (textNodes.length === 0) return null;

  return (
    <CollapsibleSection icon={<TextEditIcon />} title="Texto del SVG">
      {textNodes.map((node, i) => (
        <div className="control-group" key={node.id}>
          <label className="control-label">Texto {i + 1}</label>
          <input
            type="text"
            value={node.value}
            onChange={(e) => onTextNodeChange(node.id, e.target.value)}
          />
        </div>
      ))}
    </CollapsibleSection>
  );
}
