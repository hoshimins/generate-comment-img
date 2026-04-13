import type { RenderSettings, CommentData } from './types';

export const CANVAS_W = 1280;
export const CANVAS_H = 720;
/** 名前行とコメント本文の間隔（px） */
export const NAME_GAP = 12;

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  font: string,
): string[] {
  ctx.font = font;
  const paragraphs = text.split('\n');
  const lines: string[] = [];

  for (const para of paragraphs) {
    if (para.length === 0) {
      lines.push('');
      continue;
    }
    let current = '';
    for (const char of para) {
      const test = current + char;
      if (ctx.measureText(test).width > maxWidth && current !== '') {
        lines.push(current);
        current = char;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

function fitText(
  ctx: CanvasRenderingContext2D,
  settings: RenderSettings,
  comment: CommentData,
): { size: number; lines: string[] } {
  const { box, padding, lineHeight, maxFontSize, minFontSize, fontWeight, fontFamily, nameSize } = settings;
  const availableW = box.w - padding * 2;
  const availableH = box.h - padding * 2 - nameSize - NAME_GAP;

  for (let size = maxFontSize; size >= minFontSize; size--) {
    const font = `${fontWeight} ${size}px ${fontFamily}`;
    const lines = wrapText(ctx, comment.text, availableW, font);
    if (lines.length * size * lineHeight <= availableH) {
      return { size, lines };
    }
  }

  const font = `${fontWeight} ${minFontSize}px ${fontFamily}`;
  return { size: minFontSize, lines: wrapText(ctx, comment.text, availableW, font) };
}

export function render(
  ctx: CanvasRenderingContext2D,
  settings: RenderSettings,
  comment: CommentData,
  bgImage: HTMLImageElement | null,
): void {
  // Clear
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Background image (letterbox fit)
  if (bgImage) {
    const scale = Math.min(CANVAS_W / bgImage.width, CANVAS_H / bgImage.height);
    const dw = bgImage.width * scale;
    const dh = bgImage.height * scale;
    ctx.drawImage(bgImage, (CANVAS_W - dw) / 2, (CANVAS_H - dh) / 2, dw, dh);
  }

  const { box, padding, lineHeight, fontWeight, fontFamily, textColor, nameColor, nameSize, showDebug } = settings;

  // Debug guide
  if (showDebug) {
    ctx.save();
    ctx.strokeStyle = '#DB6567';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 8]);
    ctx.strokeRect(box.x, box.y, box.w, box.h);
    ctx.restore();
  }

  const fit = fitText(ctx, settings, comment);

  // Author name
  ctx.save();
  ctx.font = `700 ${nameSize}px ${fontFamily}`;
  ctx.fillStyle = nameColor;
  ctx.textBaseline = 'top';
  ctx.fillText(comment.name, box.x + padding, box.y + padding);
  ctx.restore();

  // Comment body
  const startY = box.y + padding + nameSize + NAME_GAP;
  ctx.save();
  ctx.font = `${fontWeight} ${fit.size}px ${fontFamily}`;
  ctx.fillStyle = textColor;
  ctx.textBaseline = 'top';
  fit.lines.forEach((line, i) => {
    ctx.fillText(line, box.x + padding, startY + i * fit.size * lineHeight);
  });
  ctx.restore();
}
