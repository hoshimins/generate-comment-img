import type { CommentData, RenderSettings } from './types';
import { render, calcBubbleDimensions, CANVAS_W, CANVAS_H } from './renderer';
import JSZip from 'jszip';

export function parseBatchInput(raw: string): CommentData[] {
  return raw
    .split(/\n[ \t]*\n/)
    .map(block => block.trim())
    .filter(block => block.length > 0)
    .flatMap(block => {
      const commaIdx = block.indexOf(',');
      if (commaIdx === -1) return [];
      const name = block.slice(0, commaIdx).trim();
      const text = block.slice(commaIdx + 1).trim();
      if (!name || !text) return [];
      return [{ name, text }];
    });
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('canvas.toBlob returned null'));
    }, 'image/png');
  });
}

export async function exportBatch(
  comments: CommentData[],
  settings: RenderSettings,
  bgImage: HTMLImageElement | null,
  avatarImage: HTMLImageElement | null,
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  const zip = new JSZip();
  const total = comments.length;

  if (settings.renderMode === 'bubble') {
    // Tight canvas per comment — no transparent padding
    for (let i = 0; i < total; i++) {
      const comment = comments[i];
      if (!comment) continue;
      const offscreen = document.createElement('canvas');
      const offCtx = offscreen.getContext('2d')!;
      const dims = calcBubbleDimensions(offCtx, settings, comment);
      offscreen.width = Math.ceil(dims.w);
      offscreen.height = Math.ceil(dims.h);
      const tightSettings = {
        ...settings,
        box: { x: 0, y: 0, w: dims.w, h: dims.h },
      };
      render(offCtx, tightSettings, comment, bgImage, avatarImage);
      const blob = await canvasToBlob(offscreen);
      zip.file(`comment_${String(i + 1).padStart(3, '0')}.png`, blob);
      onProgress?.(i + 1, total);
    }
  } else {
    // Overlay mode: shared 1280×720 offscreen canvas
    const offscreen = document.createElement('canvas');
    offscreen.width = CANVAS_W;
    offscreen.height = CANVAS_H;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return;
    for (let i = 0; i < total; i++) {
      const comment = comments[i];
      if (!comment) continue;
      render(ctx, settings, comment, bgImage, avatarImage);
      const blob = await canvasToBlob(offscreen);
      zip.file(`comment_${String(i + 1).padStart(3, '0')}.png`, blob);
      onProgress?.(i + 1, total);
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'comments.zip';
  a.click();
  URL.revokeObjectURL(url);
}
