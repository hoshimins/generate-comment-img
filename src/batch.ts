import type { CommentData, RenderSettings } from './types';
import { render, CANVAS_W, CANVAS_H } from './renderer';
import JSZip from 'jszip';

export function parseBatchInput(raw: string): CommentData[] {
  // エントリーは空行で区切る。各エントリーの最初のカンマで名前と本文を分離。
  // 例:
  //   @viewer_01,じっとしてて！
  //   その位置なら待った方がいいかも
  //
  //   @viewer_02,草
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
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  // オフスクリーンcanvasを使うことで、バッチ中もメインプレビューを保持する
  const offscreen = document.createElement('canvas');
  offscreen.width = CANVAS_W;
  offscreen.height = CANVAS_H;
  const ctx = offscreen.getContext('2d');
  if (!ctx) return;

  const zip = new JSZip();
  const total = comments.length;

  for (let i = 0; i < total; i++) {
    const comment = comments[i];
    if (!comment) continue;
    render(ctx, settings, comment, bgImage);
    const blob = await canvasToBlob(offscreen);
    zip.file(`comment_${String(i + 1).padStart(3, '0')}.png`, blob);
    onProgress?.(i + 1, total);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'comments.zip';
  a.click();
  URL.revokeObjectURL(url);
}
