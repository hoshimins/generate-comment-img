import '@fontsource-variable/noto-sans-jp';
import './style.css';
import { render, calcBubbleDimensions, CANVAS_W, CANVAS_H } from './renderer';
import { readSettings, writeSettings, readComment, onChange, getUploadEl, getAvatarUploadEl } from './state';
import { initDragInteraction } from './canvas-interaction';
import { loadPresets, savePreset, deletePreset } from './presets';
import { parseBatchInput, exportBatch } from './batch';
import type { Preset } from './types';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;

let bgImage: HTMLImageElement | null = null;
let avatarImage: HTMLImageElement | null = null;
let presets: Preset[] = [];

function draw(): void {
  const settings = readSettings();
  const comment = readComment();

  if (settings.renderMode === 'bubble') {
    // Auto-center bubble on preview canvas
    const dims = calcBubbleDimensions(ctx, settings, comment);
    const centeredSettings = {
      ...settings,
      box: {
        x: Math.round((CANVAS_W - dims.w) / 2),
        y: Math.round((CANVAS_H - dims.h) / 2),
        w: dims.w,
        h: dims.h,
      },
    };
    render(ctx, centeredSettings, comment, bgImage, avatarImage);
  } else {
    render(ctx, settings, comment, bgImage, avatarImage);
  }
}

function applyModeVisibility(): void {
  const checked = document.querySelector('input[name="renderMode"]:checked') as HTMLInputElement | null;
  const mode = checked?.value ?? 'overlay';
  document.querySelectorAll<HTMLElement>('.bubbleOnly').forEach(el => {
    el.style.display = mode === 'bubble' ? '' : 'none';
  });
  document.querySelectorAll<HTMLElement>('.overlayOnly').forEach(el => {
    el.style.display = mode === 'overlay' ? '' : 'none';
  });
}

function populatePresetSelect(): void {
  const select = document.getElementById('presetSelect') as HTMLSelectElement;
  const prev = select.value;
  presets = loadPresets();
  select.innerHTML = '';
  for (const p of presets) {
    const opt = document.createElement('option');
    opt.value = p.name;
    opt.textContent = p.readonly ? `${p.name} (デフォルト)` : p.name;
    select.appendChild(opt);
  }
  if (presets.some(p => p.name === prev)) select.value = prev;
}

function readImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function init(): Promise<void> {
  await document.fonts.ready;

  applyModeVisibility();

  initDragInteraction(canvas, readSettings, draw);
  onChange(draw);

  document.querySelectorAll('input[name="renderMode"]').forEach(el => {
    el.addEventListener('change', () => {
      applyModeVisibility();
      draw();
    });
  });

  getUploadEl().addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    bgImage = await readImage(file);
    draw();
  });

  getAvatarUploadEl().addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    avatarImage = await readImage(file);
    draw();
  });

  document.getElementById('renderBtn')!.addEventListener('click', draw);

  document.getElementById('downloadBtn')!.addEventListener('click', () => {
    const settings = readSettings();
    const comment = readComment();

    if (settings.renderMode === 'bubble') {
      // Tight canvas — no transparent padding
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
      const a = document.createElement('a');
      a.download = 'comment_bubble.png';
      a.href = offscreen.toDataURL('image/png');
      a.click();
    } else {
      draw();
      const a = document.createElement('a');
      a.download = 'comment_frame.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
    }
  });

  populatePresetSelect();

  document.getElementById('presetLoadBtn')!.addEventListener('click', () => {
    const select = document.getElementById('presetSelect') as HTMLSelectElement;
    const preset = presets.find(p => p.name === select.value);
    if (!preset) return;
    writeSettings(preset.settings);
    applyModeVisibility();
    draw();
  });

  document.getElementById('presetSaveBtn')!.addEventListener('click', () => {
    const name = prompt('プリセット名を入力してください')?.trim();
    if (!name) return;
    savePreset(name, readSettings());
    populatePresetSelect();
    (document.getElementById('presetSelect') as HTMLSelectElement).value = name;
  });

  document.getElementById('presetDeleteBtn')!.addEventListener('click', () => {
    const select = document.getElementById('presetSelect') as HTMLSelectElement;
    const name = select.value;
    const preset = presets.find(p => p.name === name);
    if (!preset) return;
    if (preset.readonly) { alert('デフォルトプリセットは削除できません'); return; }
    if (!confirm(`「${name}」を削除しますか？`)) return;
    deletePreset(name);
    populatePresetSelect();
  });

  const batchBtn = document.getElementById('batchExportBtn') as HTMLButtonElement;
  batchBtn.addEventListener('click', async () => {
    const textarea = document.getElementById('batchInput') as HTMLTextAreaElement;
    const comments = parseBatchInput(textarea.value);
    if (comments.length === 0) {
      alert('書き出せるコメントが見つかりません。\n形式: @username コメント本文');
      return;
    }
    batchBtn.disabled = true;
    const settings = readSettings();
    try {
      await exportBatch(comments, settings, bgImage, avatarImage, (done, total) => {
        batchBtn.textContent = `${done} / ${total} 書き出し中...`;
      });
    } finally {
      batchBtn.disabled = false;
      batchBtn.textContent = 'ZIPで書き出し';
      draw();
    }
  });

  draw();
}

init().catch(console.error);
