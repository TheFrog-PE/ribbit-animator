import { useCallback, useEffect, useRef, useState } from 'react';
import type { SvgFileEntry } from '../types';

const MAX_FILES = 20;

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('No se pudo leer el archivo'));
    reader.readAsText(file);
  });
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('No se pudo leer el archivo'));
    reader.readAsDataURL(file);
  });
}

function makeThumbnail(svgText: string): string {
  // Si ya es un dataurl (por ejemplo, el envoltorio de la imagen), lo retornamos directamente
  if (svgText.startsWith('data:')) return svgText;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgText)))}`;
}

export function useSvgFiles(imageModeActive: boolean = false) {
  const [filesList, setFilesList] = useState<SvgFileEntry[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const filesRef = useRef<SvgFileEntry[]>([]);
  useEffect(() => {
    filesRef.current = filesList;
  }, [filesList]);

  const addFiles = useCallback(async (incoming: FileList | File[]) => {
    const filterRegex = imageModeActive ? /\.(png|jpe?g)$/i : /\.svg$/i;
    const files = Array.from(incoming).filter((f) => filterRegex.test(f.name));
    setError(null);

    for (const file of files) {
      if (filesRef.current.length >= MAX_FILES) {
        setError(`Límite alcanzado: sólo puedes subir un máximo de ${MAX_FILES} archivos.`);
        break;
      }
      if (filesRef.current.some((f) => f.name === file.name)) {
        setError(`El archivo "${file.name}" ya está en la mesa de trabajo.`);
        continue;
      }

      try {
        let content = '';
        if (imageModeActive) {
          // Si es imagen (PNG/JPG), la leemos como DataURL y la envolvemos en un contenedor SVG virtual
          const dataUrl = await readFileAsDataURL(file);
          
          // Creamos una promesa temporal para cargar la imagen y obtener sus dimensiones nativas
          const dimensions = await new Promise<{ w: number; h: number }>((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ w: img.width || 800, h: img.height || 600 });
            img.onerror = () => resolve({ w: 800, h: 600 });
            img.src = dataUrl;
          });

          // Envoltura SVG compatible con todo nuestro motor de parser
          content = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dimensions.w} ${dimensions.h}" width="${dimensions.w}" height="${dimensions.h}"><image href="${dataUrl}" x="0" y="0" width="${dimensions.w}" height="${dimensions.h}" /></svg>`;
        } else {
          content = await readFileAsText(file);
        }

        const entry: SvgFileEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: file.name,
          content,
          thumbnail: makeThumbnail(content),
        };
        filesRef.current = [...filesRef.current, entry];
        setFilesList(filesRef.current);
        setActiveFileId(entry.id);
      } catch {
        setError(`No se pudo leer el archivo "${file.name}".`);
      }
    }
  }, [imageModeActive]);

  const selectFile = useCallback((id: string) => {
    setActiveFileId(id);
  }, []);

  const deleteFile = useCallback((id: string) => {
    setFilesList((current) => {
      const next = current.filter((f) => f.id !== id);
      filesRef.current = next;
      setActiveFileId((activeId) => (activeId !== id ? activeId : next.length > 0 ? next[0].id : null));
      return next;
    });
  }, []);

  const updateTextEdit = useCallback((fileId: string, nodeId: string, value: string) => {
    setFilesList((current) => {
      const next = current.map((f) =>
        f.id === fileId ? { ...f, textEdits: { ...f.textEdits, [nodeId]: value } } : f,
      );
      filesRef.current = next;
      return next;
    });
  }, []);

  const activeFile = filesList.find((f) => f.id === activeFileId) ?? null;

  return {
    filesList,
    activeFile,
    activeFileId,
    addFiles,
    selectFile,
    deleteFile,
    updateTextEdit,
    error,
    maxFiles: MAX_FILES,
  };
}
