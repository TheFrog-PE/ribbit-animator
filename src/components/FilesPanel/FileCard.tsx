import type { SvgFileEntry } from '../../types';
import { TrashIcon } from '../icons';

interface Props {
  file: SvgFileEntry;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function FileCard({ file, active, onSelect, onDelete }: Props) {
  return (
    <div className={`file-card${active ? ' active' : ''}`} onClick={onSelect}>
      <div className="file-card-thumb">
        {file.thumbnail && <img src={file.thumbnail} alt="" />}
      </div>
      <div className="file-card-name" title={file.name}>
        {file.name}
      </div>
      <button
        className="file-card-delete"
        title="Eliminar"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <TrashIcon />
      </button>
    </div>
  );
}
