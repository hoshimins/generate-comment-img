import { render } from './renderer';
import JSZip from 'jszip';
const LINE_RE = /^@(\S+)[\s\t]+(.+)$/;
export function parseBatchInput(raw) {
    return raw
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .flatMap(line => {
        const m = LINE_RE.exec(line);
        if (!m || !m[1] || !m[2])
            return [];
        return [{ name: '@' + m[1], text: m[2] }];
    });
}
function canvasToBlob(canvas) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (blob)
                resolve(blob);
            else
                reject(new Error('canvas.toBlob returned null'));
        }, 'image/png');
    });
}
export async function exportBatch(comments, settings, bgImage, canvas, onProgress) {
    const ctx = canvas.getContext('2d');
    if (!ctx)
        return;
    const zip = new JSZip();
    const total = comments.length;
    for (let i = 0; i < total; i++) {
        const comment = comments[i];
        if (!comment)
            continue;
        render(ctx, settings, comment, bgImage);
        const blob = await canvasToBlob(canvas);
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
