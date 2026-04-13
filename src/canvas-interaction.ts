import type { RenderSettings } from './types';
import { writeSettings } from './state';

const GRAB_MARGIN = 12; // canvas pixels

type DragMode =
  | 'idle'
  | 'move'
  | 'resize-n' | 'resize-s' | 'resize-e' | 'resize-w'
  | 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-se';

interface DragState {
  mode: Exclude<DragMode, 'idle'>;
  startX: number;
  startY: number;
  boxStart: { x: number; y: number; w: number; h: number };
}

function toCanvasCoords(e: MouseEvent, canvas: HTMLCanvasElement): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.offsetX * (canvas.width / rect.width),
    y: e.offsetY * (canvas.height / rect.height),
  };
}

function getMode(
  cx: number,
  cy: number,
  box: { x: number; y: number; w: number; h: number },
): DragMode {
  const { x, y, w, h } = box;
  if (cx < x || cx > x + w || cy < y || cy > y + h) return 'idle';

  const nearL = cx - x <= GRAB_MARGIN;
  const nearR = x + w - cx <= GRAB_MARGIN;
  const nearT = cy - y <= GRAB_MARGIN;
  const nearB = y + h - cy <= GRAB_MARGIN;

  if (nearT && nearL) return 'resize-nw';
  if (nearT && nearR) return 'resize-ne';
  if (nearB && nearL) return 'resize-sw';
  if (nearB && nearR) return 'resize-se';
  if (nearT) return 'resize-n';
  if (nearB) return 'resize-s';
  if (nearL) return 'resize-w';
  if (nearR) return 'resize-e';

  return 'move';
}

function modeToCursor(mode: DragMode): string {
  switch (mode) {
    case 'move':       return 'move';
    case 'resize-n':
    case 'resize-s':   return 'ns-resize';
    case 'resize-e':
    case 'resize-w':   return 'ew-resize';
    case 'resize-nw':
    case 'resize-se':  return 'nwse-resize';
    case 'resize-ne':
    case 'resize-sw':  return 'nesw-resize';
    default:           return 'default';
  }
}

export function initDragInteraction(
  canvas: HTMLCanvasElement,
  getSettings: () => RenderSettings,
  onUpdate: () => void,
): void {
  let drag: DragState | null = null;

  canvas.addEventListener('mousedown', (e) => {
    const { x, y } = toCanvasCoords(e, canvas);
    const s = getSettings();
    const mode = getMode(x, y, s.box);
    if (mode === 'idle') return;
    drag = { mode, startX: x, startY: y, boxStart: { ...s.box } };
    e.preventDefault();
  });

  canvas.addEventListener('mousemove', (e) => {
    const { x, y } = toCanvasCoords(e, canvas);
    const s = getSettings();

    if (!drag) {
      canvas.style.cursor = modeToCursor(getMode(x, y, s.box));
      return;
    }

    const dx = x - drag.startX;
    const dy = y - drag.startY;
    const b = { ...drag.boxStart };

    if (drag.mode === 'move') {
      b.x = Math.round(b.x + dx);
      b.y = Math.round(b.y + dy);
    } else {
      // Split mode string after the dash to get direction letters (e.g. 'nw', 'se', 'e')
      const dir = drag.mode.split('-')[1] ?? '';
      const isN = dir.includes('n');
      const isS = dir.includes('s');
      const isE = dir.includes('e');
      const isW = dir.includes('w');

      if (isE) b.w = Math.max(50, Math.round(b.w + dx));
      if (isS) b.h = Math.max(50, Math.round(b.h + dy));
      if (isW) { b.x = Math.round(b.x + dx); b.w = Math.max(50, Math.round(b.w - dx)); }
      if (isN) { b.y = Math.round(b.y + dy); b.h = Math.max(50, Math.round(b.h - dy)); }
    }

    const updated: RenderSettings = { ...s, box: b };
    writeSettings(updated);
    onUpdate();
  });

  const stopDrag = () => { drag = null; };
  canvas.addEventListener('mouseup', stopDrag);
  canvas.addEventListener('mouseleave', stopDrag);
}
