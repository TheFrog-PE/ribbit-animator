const AVIIF_KEYFRAME = 0x00000010;
const AVIF_HASINDEX = 0x00000010;

function writeFourCC(target: Uint8Array, offset: number, code: string) {
  for (let i = 0; i < 4; i++) target[offset + i] = code.charCodeAt(i);
}

function concatUint8Arrays(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, p) => sum + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}

/** Envuelve `data` en un chunk RIFF: fourCC(4) + size(4, LE, = data.length) + data (+ pad byte si data.length es impar). */
function makeChunk(fourCC: string, data: Uint8Array): Uint8Array {
  const pad = data.length % 2;
  const out = new Uint8Array(8 + data.length + pad);
  writeFourCC(out, 0, fourCC);
  new DataView(out.buffer).setUint32(4, data.length, true);
  out.set(data, 8);
  return out;
}

/** Envuelve una serie de chunks (ya serializados con su propio header) en un LIST RIFF. */
function makeList(listType: string, chunks: Uint8Array[]): Uint8Array {
  const body = concatUint8Arrays(chunks);
  const out = new Uint8Array(12 + body.length);
  writeFourCC(out, 0, 'LIST');
  new DataView(out.buffer).setUint32(4, 4 + body.length, true);
  writeFourCC(out, 8, listType);
  out.set(body, 12);
  return out;
}

/** Convierte ImageData (RGBA, top-down, como lo entrega Canvas) a BGRA bottom-up, formato esperado por BITMAPINFOHEADER con altura positiva. */
function rgbaToBgraBottomUp(imageData: ImageData): Uint8Array {
  const { width, height, data } = imageData;
  const out = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    const srcOffset = y * width * 4;
    const dstOffset = (height - 1 - y) * width * 4;
    for (let x = 0; x < width; x++) {
      const so = srcOffset + x * 4;
      const dOff = dstOffset + x * 4;
      out[dOff] = data[so + 2]; // B
      out[dOff + 1] = data[so + 1]; // G
      out[dOff + 2] = data[so]; // R
      out[dOff + 3] = data[so + 3]; // A
    }
  }
  return out;
}

/**
 * Escribe un contenedor AVI RIFF sin comprimir, 32bpp BGRA con canal alfa (lossless),
 * compatible con la interpretación "straight/premultiplied alpha" de Premiere/After Effects/Resolve.
 */
export class AVIWriter {
  private width: number;
  private height: number;
  private fps: number;
  private frames: Uint8Array[] = [];

  constructor(width: number, height: number, fps: number) {
    this.width = width;
    this.height = height;
    this.fps = fps;
  }

  addFrame(imageData: ImageData): void {
    if (imageData.width !== this.width || imageData.height !== this.height) {
      throw new Error(
        `Tamaño de frame inesperado: ${imageData.width}x${imageData.height}, se esperaba ${this.width}x${this.height}`,
      );
    }
    this.frames.push(rgbaToBgraBottomUp(imageData));
  }

  get frameCount(): number {
    return this.frames.length;
  }

  finalize(): Blob {
    const { width, height, fps, frames } = this;
    const totalFrames = frames.length;
    const frameSize = width * height * 4;

    // avih — AVIMAINHEADER (56 bytes)
    const avih = new Uint8Array(56);
    {
      const dv = new DataView(avih.buffer);
      dv.setUint32(0, Math.round(1_000_000 / fps), true); // dwMicroSecPerFrame
      dv.setUint32(4, 0, true); // dwMaxBytesPerSec
      dv.setUint32(8, 0, true); // dwPaddingGranularity
      dv.setUint32(12, AVIF_HASINDEX, true); // dwFlags
      dv.setUint32(16, totalFrames, true); // dwTotalFrames
      dv.setUint32(20, 0, true); // dwInitialFrames
      dv.setUint32(24, 1, true); // dwStreams
      dv.setUint32(28, frameSize, true); // dwSuggestedBufferSize
      dv.setUint32(32, width, true); // dwWidth
      dv.setUint32(36, height, true); // dwHeight
    }

    // strh — AVISTREAMHEADER (56 bytes)
    const strh = new Uint8Array(56);
    {
      writeFourCC(strh, 0, 'vids');
      // fccHandler = 0 -> sin compresión (BI_RGB)
      const dv = new DataView(strh.buffer);
      dv.setUint32(8, 0, true); // dwFlags
      dv.setUint16(12, 0, true); // wPriority
      dv.setUint16(14, 0, true); // wLanguage
      dv.setUint32(16, 0, true); // dwInitialFrames
      dv.setUint32(20, 1, true); // dwScale
      dv.setUint32(24, fps, true); // dwRate
      dv.setUint32(28, 0, true); // dwStart
      dv.setUint32(32, totalFrames, true); // dwLength
      dv.setUint32(36, frameSize, true); // dwSuggestedBufferSize
      dv.setInt32(40, -1, true); // dwQuality
      dv.setUint32(44, 0, true); // dwSampleSize
      dv.setInt16(48, 0, true); // rcFrame.left
      dv.setInt16(50, 0, true); // rcFrame.top
      dv.setInt16(52, width, true); // rcFrame.right
      dv.setInt16(54, height, true); // rcFrame.bottom
    }

    // strf — BITMAPINFOHEADER (40 bytes), biHeight positivo = DIB bottom-up
    const strf = new Uint8Array(40);
    {
      const dv = new DataView(strf.buffer);
      dv.setUint32(0, 40, true); // biSize
      dv.setInt32(4, width, true); // biWidth
      dv.setInt32(8, height, true); // biHeight
      dv.setUint16(12, 1, true); // biPlanes
      dv.setUint16(14, 32, true); // biBitCount
      dv.setUint32(16, 0, true); // biCompression = BI_RGB
      dv.setUint32(20, frameSize, true); // biSizeImage
      dv.setInt32(24, 0, true); // biXPelsPerMeter
      dv.setInt32(28, 0, true); // biYPelsPerMeter
      dv.setUint32(32, 0, true); // biClrUsed
      dv.setUint32(36, 0, true); // biClrImportant
    }

    const strhChunk = makeChunk('strh', strh);
    const strfChunk = makeChunk('strf', strf);
    const strlList = makeList('strl', [strhChunk, strfChunk]);
    const avihChunk = makeChunk('avih', avih);
    const hdrlList = makeList('hdrl', [avihChunk, strlList]);

    // Calcular la cabecera 'LIST' para el bloque 'movi' sin concatenar los frames en memoria
    const totalFramesLength = totalFrames * (8 + frameSize);
    const moviHeader = new Uint8Array(12);
    writeFourCC(moviHeader, 0, 'LIST');
    new DataView(moviHeader.buffer).setUint32(4, 4 + totalFramesLength, true);
    writeFourCC(moviHeader, 8, 'movi');

    // idx1: offsets relativos al primer byte tras el fourCC 'movi'
    let runningOffset = 0;
    const idxEntries = new Uint8Array(totalFrames * 16);
    const idxDV = new DataView(idxEntries.buffer);
    for (let i = 0; i < totalFrames; i++) {
      const offset = i * 16;
      writeFourCC(idxEntries, offset, '00dc');
      idxDV.setUint32(offset + 4, AVIIF_KEYFRAME, true);
      idxDV.setUint32(offset + 8, runningOffset, true);
      idxDV.setUint32(offset + 12, frameSize, true); // frames siempre tienen tamaño par -> sin padding
      runningOffset += 8 + frameSize;
    }

    const idxHeader = new Uint8Array(8);
    writeFourCC(idxHeader, 0, 'idx1');
    new DataView(idxHeader.buffer).setUint32(4, idxEntries.length, true);

    // Cabecera principal RIFF
    const moviListLength = 12 + totalFramesLength;
    const idxChunkLength = 8 + idxEntries.length;
    const riffContentLength = hdrlList.length + moviListLength + idxChunkLength;

    const riffHeader = new Uint8Array(12);
    writeFourCC(riffHeader, 0, 'RIFF');
    new DataView(riffHeader.buffer).setUint32(4, 4 + riffContentLength, true);
    writeFourCC(riffHeader, 8, 'AVI ');

    // Agregar todas las partes de forma fragmentada para evitar superar el límite de ArrayBuffer del navegador
    const blobParts: BlobPart[] = [];
    blobParts.push(riffHeader as BlobPart);
    blobParts.push(hdrlList as BlobPart);
    blobParts.push(moviHeader as BlobPart);

    for (let i = 0; i < totalFrames; i++) {
      const f = frames[i];
      const chunkHeader = new Uint8Array(8);
      writeFourCC(chunkHeader, 0, '00dc');
      new DataView(chunkHeader.buffer).setUint32(4, f.length, true);
      blobParts.push(chunkHeader as BlobPart);
      blobParts.push(f as BlobPart);
    }

    blobParts.push(idxHeader as BlobPart);
    blobParts.push(idxEntries as BlobPart);

    return new Blob(blobParts, { type: 'video/avi' });
  }
}
