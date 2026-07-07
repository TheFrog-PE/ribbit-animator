import { useCallback, useMemo, useRef, useState } from 'react';
import { DEFAULT_CONFIG, type AnimConfig } from './types';
import { useSvgFiles } from './hooks/useSvgFiles';
import { useSvgScene } from './hooks/useSvgScene';
import { exportToAvi, downloadBlob, type ExportProgress } from './lib/exportEngine';
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel/ControlPanel';
import { PreviewPane } from './components/Preview/PreviewPane';
import { FilesPanel } from './components/FilesPanel/FilesPanel';
import { ProgressOverlay } from './components/ProgressOverlay';
import { WelcomeToast } from './components/WelcomeToast';
import { AlertToastContainer } from './components/AlertToast';

function App() {
  const [config, setConfig] = useState<AnimConfig>(DEFAULT_CONFIG);
  const onChange = useCallback((patch: Partial<AnimConfig>) => {
    setConfig((c) => ({ ...c, ...patch }));
  }, []);

  const {
    filesList,
    activeFile,
    activeFileId,
    addFiles,
    selectFile,
    deleteFile,
    updateTextEdit,
    error: filesError,
    maxFiles,
  } = useSvgFiles(config.imageModeActive);

  const { parsed, renderer, totalDuration, error: sceneError } = useSvgScene(activeFile, config);

  const textNodes = useMemo(
    () =>
      (parsed?.textNodes ?? []).map((node) => ({
        id: node.id,
        value: activeFile?.textEdits?.[node.id] ?? node.originalText,
        originalText: node.originalText,
      })),
    [parsed, activeFile?.textEdits],
  );

  const handleTextNodeChange = useCallback(
    (nodeId: string, value: string) => {
      if (activeFileId) updateTextEdit(activeFileId, nodeId, value);
    },
    [activeFileId, updateTextEdit],
  );

  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [resyncSignal, setResyncSignal] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRequestUpload = useCallback(() => fileInputRef.current?.click(), []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) addFiles(e.target.files);
      e.target.value = '';
    },
    [addFiles],
  );

  const handleExport = useCallback(async () => {
    if (!parsed || !renderer) return;
    setExportProgress({ current: 0, total: 1 });
    try {
      const blob = await exportToAvi(parsed, renderer, config, totalDuration, setExportProgress);
      const baseName = activeFile?.name.replace(/\.svg$/i, '') || 'ribbit';
      downloadBlob(blob, `${baseName}.avi`);

      // Sonido de notificación Mario Galaxy al finalizar exportación
      try {
        const audio = new Audio('/mario-galaxy-notificacion-mando.mp3');
        audio.play();
      } catch (soundErr) {
        console.warn('No se pudo reproducir el audio de notificación:', soundErr);
      }
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Ocurrió un error exportando el video.');
    } finally {
      setExportProgress(null);
      setResyncSignal((n) => n + 1);
    }
  }, [parsed, renderer, config, totalDuration, activeFile]);

  const handleExportAll = useCallback(async () => {
    if (filesList.length === 0) return;
    setExportProgress({ current: 0, total: 1 });
    try {
      const { parseSvgMarkup } = await import('./lib/svgParser');
      const { buildScene, FrameRenderer } = await import('./lib/frameRenderer');

      // Iteramos archivo por archivo en la lista de subidos
      for (let i = 0; i < filesList.length; i++) {
        const fileEntry = filesList[i];
        
        // 1. Parsear el marcado del archivo SVG
        const docParsed = parseSvgMarkup(fileEntry.content);

        // 2. Aplicar ediciones de texto persistidas si las hubiera
        if (fileEntry.textEdits) {
          for (const node of docParsed.textNodes) {
            const value = fileEntry.textEdits[node.id] ?? node.originalText;
            node.el.textContent = value;
          }
        }

        // 3. Crear escena y frame renderer temporales
        const tempLetters = buildScene(docParsed, config);
        const tempRenderer = new FrameRenderer(docParsed.svgEl, tempLetters);

        // 4. Exportar
        const blob = await exportToAvi(docParsed, tempRenderer, config, totalDuration, (progress) => {
          // Normalizamos el progreso global
          // total: número total de frames del video individual
          // current: frame actual procesado del video individual
          setExportProgress({
            current: Math.round(((i + (progress.current / progress.total)) / filesList.length) * 100),
            total: 100
          });
        });

        // 5. Descargar archivo
        const baseName = fileEntry.name.replace(/\.svg$/i, '') || `ribbit-${i}`;
        downloadBlob(blob, `${baseName}.avi`);
      }

      // Sonido de notificación Mario Galaxy al finalizar toda la cola
      try {
        const audio = new Audio('/mario-galaxy-notificacion-mando.mp3');
        audio.play();
      } catch (soundErr) {
        console.warn('No se pudo reproducir el audio de notificación:', soundErr);
      }
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Ocurrió un error exportando todos los videos.');
    } finally {
      setExportProgress(null);
      setResyncSignal((n) => n + 1);
    }
  }, [filesList, config, totalDuration]);

  const originalColors = parsed
    ? { outline: parsed.originalOutlineColor, fill: parsed.originalFillColor }
    : null;

  return (
    <>
      <Header />
      <main className="app-main">
        <ControlPanel
          config={config}
          onChange={onChange}
          textNodes={textNodes}
          onTextNodeChange={handleTextNodeChange}
          onExport={handleExport}
          onExportAll={handleExportAll}
          exportDisabled={!parsed || !renderer || exportProgress !== null}
          exportAllDisabled={filesList.length === 0 || exportProgress !== null}
        />

        <PreviewPane
          svgEl={parsed?.svgEl ?? null}
          renderer={renderer}
          totalDuration={totalDuration}
          config={config}
          onChange={onChange}
          currentFileLabel={activeFile?.name ?? 'Sin archivo cargado'}
          originalColors={originalColors}
          onDropFiles={addFiles}
          onRequestUpload={handleRequestUpload}
          externalPause={exportProgress !== null}
          resyncSignal={resyncSignal}
          sceneError={sceneError}
        />

        <FilesPanel
          filesList={filesList}
          activeFileId={activeFileId}
          maxFiles={maxFiles}
          error={filesError}
          onSelect={selectFile}
          onDelete={deleteFile}
          onUploadClick={handleRequestUpload}
          config={config}
        />
      </main>

      <input
        ref={fileInputRef}
        type="file"
        accept={config.imageModeActive ? ".png,.jpg,.jpeg" : ".svg"}
        multiple
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />

       {exportProgress && <ProgressOverlay current={exportProgress.current} total={exportProgress.total} />}
 
       <WelcomeToast />
       <AlertToastContainer />
     </>
   );
 }

export default App;
