import type { SvgFileEntry } from '../../types';
import { FolderIcon, UploadIcon } from '../icons';
import { FileCard } from './FileCard';

interface Props {
  filesList: SvgFileEntry[];
  activeFileId: string | null;
  maxFiles: number;
  error: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onUploadClick: () => void;
  config: { imageModeActive: boolean };
}

export function FilesPanel({ filesList, activeFileId, maxFiles, error, onSelect, onDelete, onUploadClick, config }: Props) {
  const isImageMode = config.imageModeActive;
  return (
    <div className="files-panel">
      <div className="work-files-bar">
        <div className="work-files-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div className="work-files-title">
              <FolderIcon />
              Mesa de Trabajo
            </div>
            <div className="work-files-counter">
              {filesList.length} / {maxFiles}
            </div>
          </div>
          <button className="upload-btn" onClick={onUploadClick} title={isImageMode ? "Subir una o varias imágenes PNG / JPG" : "Subir uno o varios archivos SVG"}>
            <UploadIcon />
            {isImageMode ? "Subir archivo PNG" : "Subir archivo SVG"}
          </button>
          {error && <div className="files-error">{error}</div>}
        </div>

        <div className="work-files-list">
          {filesList.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              active={file.id === activeFileId}
              onSelect={() => onSelect(file.id)}
              onDelete={() => onDelete(file.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
