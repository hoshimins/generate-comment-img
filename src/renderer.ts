import type { RenderSettings, CommentData, BoxGeometry } from './types';

export const CANVAS_W = 1280;
export const CANVAS_H = 720;
/** 名前行とコメント本文の間隔（px） */
export const NAME_GAP = 10;
const BUBBLE_RADIUS_DEFAULT = 40;
const BUBBLE_BORDER_W = 6;
const TAIL_LENGTH = 44;   // how far the tail tip extends from bubble edge
const TAIL_HALF = 22;     // half-height of tail base on bubble edge

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

function drawSpeechBubblePath(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  bw: number,
  bh: number,
  r: number,
  tailSide: 'left' | 'right',
  tailMidY: number,
): void {
  // tailMidY is relative to canvas (absolute Y)
  const tailTop = tailMidY - TAIL_HALF;
  const tailBot = tailMidY + TAIL_HALF;

  ctx.beginPath();

  if (tailSide === 'left') {
    // Draw clockwise from top-left start
    ctx.moveTo(bx + r, by);
    ctx.lineTo(bx + bw - r, by);
    ctx.arcTo(bx + bw, by, bx + bw, by + r, r);
    ctx.lineTo(bx + bw, by + bh - r);
    ctx.arcTo(bx + bw, by + bh, bx + bw - r, by + bh, r);
    ctx.lineTo(bx + r, by + bh);
    ctx.arcTo(bx, by + bh, bx, by + bh - r, r);
    // Left edge: go up to tail base, spike out, come back
    ctx.lineTo(bx, tailBot);
    ctx.lineTo(bx - TAIL_LENGTH, tailMidY);  // tail tip
    ctx.lineTo(bx, tailTop);
    ctx.arcTo(bx, by, bx + r, by, r);
  } else {
    // Right tail
    ctx.moveTo(bx + r, by);
    ctx.lineTo(bx + bw - r, by);
    ctx.arcTo(bx + bw, by, bx + bw, by + r, r);
    // Right edge: go down to tail base, spike out, come back
    ctx.lineTo(bx + bw, tailTop);
    ctx.lineTo(bx + bw + TAIL_LENGTH, tailMidY);  // tail tip
    ctx.lineTo(bx + bw, tailBot);
    ctx.lineTo(bx + bw, by + bh - r);
    ctx.arcTo(bx + bw, by + bh, bx + bw - r, by + bh, r);
    ctx.lineTo(bx + r, by + bh);
    ctx.arcTo(bx, by + bh, bx, by + bh - r, r);
    ctx.lineTo(bx, by + r);
    ctx.arcTo(bx, by, bx + r, by, r);
  }

  ctx.closePath();
}

function drawDefaultAvatar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
): void {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  // Very light background
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.15;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.65;

  // Head circle — large, centered slightly above middle
  const headR = r * 0.38;
  const headY = cy - r * 0.12;
  ctx.beginPath();
  ctx.arc(cx, headY, headR, 0, Math.PI * 2);
  ctx.fill();

  // Shoulder arc — wide, positioned so only top edge peeks at bottom
  const bodyR = r * 0.62;
  const bodyY = cy + r * 0.82;
  ctx.beginPath();
  ctx.arc(cx, bodyY, bodyR, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function renderBubble(
  ctx: CanvasRenderingContext2D,
  settings: RenderSettings,
  comment: CommentData,
  avatarImage: HTMLImageElement | null,
): void {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  const {
    box, padding, lineHeight, fontWeight, fontFamily, textColor, nameColor,
    nameSize, bubbleBg, bubbleBorderColor, bubbleTailSide,
    avatarSize, bubbleMaxWidth, maxFontSize, showBubbleName,
    bubbleRadius = BUBBLE_RADIUS_DEFAULT,
  } = settings;

  // Layout: avatar is INSIDE the bubble on the left
  // Text area is to the right of avatar
  const innerPad = padding;
  const avatarAreaW = innerPad + avatarSize + innerPad;  // space for avatar inside bubble
  const textAreaW = bubbleMaxWidth - avatarAreaW - innerPad;  // right padding too

  // Wrap text at maxFontSize (bubble auto-resizes in height)
  const font = `${fontWeight} ${maxFontSize}px ${fontFamily}`;
  const lines = wrapText(ctx, comment.text, textAreaW, font);

  // Calculate bubble height
  const nameH = showBubbleName ? nameSize + NAME_GAP : 0;
  const textH = lines.length * maxFontSize * lineHeight;
  const contentH = nameH + textH;
  const bubbleH = Math.max(avatarSize + innerPad * 2, contentH + innerPad * 2);
  const bubbleW = bubbleMaxWidth;

  // Bubble top-left origin (account for tail taking up horizontal space)
  const bubbleX = bubbleTailSide === 'left'
    ? box.x + TAIL_LENGTH
    : box.x;
  const bubbleY = box.y;

  // Tail vertical center = bubble vertical center
  const tailMidY = bubbleY + bubbleH / 2;

  // Draw the speech bubble path (fill + stroke)
  ctx.save();
  drawSpeechBubblePath(ctx, bubbleX, bubbleY, bubbleW, bubbleH, bubbleRadius, bubbleTailSide, tailMidY);
  ctx.fillStyle = bubbleBg;
  ctx.fill();
  ctx.strokeStyle = bubbleBorderColor;
  ctx.lineWidth = BUBBLE_BORDER_W;
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.restore();

  // Draw avatar (clipped circle, INSIDE bubble)
  const avatarX = bubbleTailSide === 'left'
    ? bubbleX + innerPad
    : bubbleX + bubbleW - innerPad - avatarSize;
  const avatarY = bubbleY + (bubbleH - avatarSize) / 2;
  const avatarCX = avatarX + avatarSize / 2;
  const avatarCY = avatarY + avatarSize / 2;

  if (avatarImage) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarCX, avatarCY, avatarSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatarImage, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();
  } else {
    drawDefaultAvatar(ctx, avatarCX, avatarCY, avatarSize / 2, bubbleBorderColor);
  }

  // Text start position (right of avatar for left side, left of avatar for right side)
  const textX = bubbleTailSide === 'left'
    ? bubbleX + avatarAreaW
    : bubbleX + innerPad;

  // Vertical center the text content within bubble
  const textBlockY = bubbleY + (bubbleH - contentH) / 2;

  // Name
  if (showBubbleName) {
    ctx.save();
    ctx.font = `700 ${nameSize}px ${fontFamily}`;
    ctx.fillStyle = nameColor;
    ctx.textBaseline = 'top';
    ctx.fillText(comment.name, textX, textBlockY);
    ctx.restore();
  }

  // Comment text
  const commentY = textBlockY + nameH;
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = textColor;
  ctx.textBaseline = 'top';
  lines.forEach((line, i) => {
    ctx.fillText(line, textX, commentY + i * maxFontSize * lineHeight);
  });
  ctx.restore();
}

export function calcBubbleDimensions(
  ctx: CanvasRenderingContext2D,
  settings: RenderSettings,
  comment: CommentData,
): { w: number; h: number } {
  const { avatarSize, bubbleMaxWidth, padding, maxFontSize, fontWeight, fontFamily, lineHeight, showBubbleName, nameSize } = settings;
  const innerPad = padding;
  const avatarAreaW = innerPad + avatarSize + innerPad;
  const textAreaW = bubbleMaxWidth - avatarAreaW - innerPad;
  const font = `${fontWeight} ${maxFontSize}px ${fontFamily}`;
  const lines = wrapText(ctx, comment.text, textAreaW, font);
  const nameH = showBubbleName ? nameSize + NAME_GAP : 0;
  const textH = lines.length * maxFontSize * lineHeight;
  const contentH = nameH + textH;
  const bubbleH = Math.max(avatarSize + innerPad * 2, contentH + innerPad * 2);
  return { w: TAIL_LENGTH + bubbleMaxWidth, h: bubbleH };
}

export function render(
  ctx: CanvasRenderingContext2D,
  settings: RenderSettings,
  comment: CommentData,
  bgImage: HTMLImageElement | null,
  avatarImage: HTMLImageElement | null,
): void {
  if (settings.renderMode === 'bubble') {
    renderBubble(ctx, settings, comment, avatarImage);
    return;
  }

  // Overlay mode
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  if (bgImage) {
    const scale = Math.min(CANVAS_W / bgImage.width, CANVAS_H / bgImage.height);
    const dw = bgImage.width * scale;
    const dh = bgImage.height * scale;
    ctx.drawImage(bgImage, (CANVAS_W - dw) / 2, (CANVAS_H - dh) / 2, dw, dh);
  }

  const { box, padding, lineHeight, fontWeight, fontFamily, textColor, nameColor, nameSize, showDebug } = settings;

  if (showDebug) {
    ctx.save();
    ctx.strokeStyle = '#DB6567';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 8]);
    ctx.strokeRect(box.x, box.y, box.w, box.h);
    ctx.restore();
  }

  const fit = fitText(ctx, settings, comment);

  ctx.save();
  ctx.font = `700 ${nameSize}px ${fontFamily}`;
  ctx.fillStyle = nameColor;
  ctx.textBaseline = 'top';
  ctx.fillText(comment.name, box.x + padding, box.y + padding);
  ctx.restore();

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

export function getEffectiveBubbleBox(
  _ctx: CanvasRenderingContext2D,
  settings: RenderSettings,
): BoxGeometry {
  const { box, bubbleMaxWidth, avatarSize, padding, bubbleTailSide } = settings;
  const totalW = TAIL_LENGTH + bubbleMaxWidth;
  const x = bubbleTailSide === 'left' ? box.x : box.x;
  return {
    x,
    y: box.y,
    w: totalW,
    h: Math.max(avatarSize + padding * 2, 120),
  };
}
