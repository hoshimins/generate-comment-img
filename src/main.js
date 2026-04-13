import '@fontsource-variable/noto-sans-jp';
import './style.css';
import { render, CANVAS_W, CANVAS_H } from './renderer';
import { readSettings, writeSettings, readComment, onChange, getUploadEl } from './state';
import { initDragInteraction } from './canvas-interaction';
import { loadPresets, savePreset, deletePreset } from './presets';
import { parseBatchInput, exportBatch } from './batch';
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;
let bgImage = null;
let presets = [];
function draw() {
    render(ctx, readSettings(), readComment(), bgImage);
}
function populatePresetSelect() {
    const select = document.getElementById('presetSelect');
    const prev = select.value;
    presets = loadPresets();
    select.innerHTML = '';
    for (const p of presets) {
        const opt = document.createElement('option');
        opt.value = p.name;
        opt.textContent = p.readonly ? `${p.name} (デフォルト)` : p.name;
        select.appendChild(opt);
    }
    // Restore selection if still available
    if (presets.some(p => p.name === prev))
        select.value = prev;
}
function readImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = reader.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
async function init() {
    // Ensure bundled fonts are loaded before first render
    await document.fonts.ready;
    // Drag/resize interaction on canvas
    initDragInteraction(canvas, readSettings, draw);
    // Re-render on any form change
    onChange(draw);
    // Template image upload
    getUploadEl().addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        bgImage = await readImage(file);
        draw();
    });
    // Single PNG download
    document.getElementById('renderBtn').addEventListener('click', draw);
    document.getElementById('downloadBtn').addEventListener('click', () => {
        draw();
        const a = document.createElement('a');
        a.download = 'comment_frame.png';
        a.href = canvas.toDataURL('image/png');
        a.click();
    });
    // Presets
    populatePresetSelect();
    document.getElementById('presetLoadBtn').addEventListener('click', () => {
        const select = document.getElementById('presetSelect');
        const preset = presets.find(p => p.name === select.value);
        if (!preset)
            return;
        writeSettings(preset.settings);
        draw();
    });
    document.getElementById('presetSaveBtn').addEventListener('click', () => {
        const name = prompt('プリセット名を入力してください')?.trim();
        if (!name)
            return;
        savePreset(name, readSettings());
        populatePresetSelect();
        document.getElementById('presetSelect').value = name;
    });
    document.getElementById('presetDeleteBtn').addEventListener('click', () => {
        const select = document.getElementById('presetSelect');
        const name = select.value;
        const preset = presets.find(p => p.name === name);
        if (!preset)
            return;
        if (preset.readonly) {
            alert('デフォルトプリセットは削除できません');
            return;
        }
        if (!confirm(`「${name}」を削除しますか？`))
            return;
        deletePreset(name);
        populatePresetSelect();
    });
    // Batch ZIP export
    const batchBtn = document.getElementById('batchExportBtn');
    batchBtn.addEventListener('click', async () => {
        const textarea = document.getElementById('batchInput');
        const comments = parseBatchInput(textarea.value);
        if (comments.length === 0) {
            alert('書き出せるコメントが見つかりません。\n形式: @username コメント本文');
            return;
        }
        batchBtn.disabled = true;
        const settings = readSettings();
        try {
            await exportBatch(comments, settings, bgImage, canvas, (done, total) => {
                batchBtn.textContent = `${done} / ${total} 書き出し中...`;
            });
        }
        finally {
            batchBtn.disabled = false;
            batchBtn.textContent = 'ZIPで書き出し';
            draw(); // Restore preview
        }
    });
    draw();
}
init().catch(console.error);
