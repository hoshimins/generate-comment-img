function getEl(id) {
    const el = document.getElementById(id);
    if (!el)
        throw new Error(`Element #${id} not found`);
    return el;
}
const els = {
    bgUpload: getEl('bgUpload'),
    commentText: getEl('commentText'),
    nameText: getEl('nameText'),
    nameSize: getEl('nameSize'),
    boxX: getEl('boxX'),
    boxY: getEl('boxY'),
    boxW: getEl('boxW'),
    boxH: getEl('boxH'),
    padding: getEl('padding'),
    lineHeight: getEl('lineHeight'),
    maxFontSize: getEl('maxFontSize'),
    minFontSize: getEl('minFontSize'),
    fontWeight: getEl('fontWeight'),
    fontFamily: getEl('fontFamily'),
    textColor: getEl('textColor'),
    nameColor: getEl('nameColor'),
    showDebug: getEl('showDebug'),
};
function num(el) {
    return Number(el.value || 0);
}
export function readSettings() {
    return {
        box: {
            x: num(els.boxX),
            y: num(els.boxY),
            w: num(els.boxW),
            h: num(els.boxH),
        },
        padding: num(els.padding),
        lineHeight: Number(els.lineHeight.value),
        maxFontSize: num(els.maxFontSize),
        minFontSize: num(els.minFontSize),
        fontWeight: els.fontWeight.value,
        fontFamily: els.fontFamily.value,
        textColor: els.textColor.value,
        nameColor: els.nameColor.value,
        nameSize: num(els.nameSize),
        showDebug: els.showDebug.checked,
    };
}
export function writeSettings(s) {
    els.boxX.value = String(s.box.x);
    els.boxY.value = String(s.box.y);
    els.boxW.value = String(s.box.w);
    els.boxH.value = String(s.box.h);
    els.padding.value = String(s.padding);
    els.lineHeight.value = String(s.lineHeight);
    els.maxFontSize.value = String(s.maxFontSize);
    els.minFontSize.value = String(s.minFontSize);
    els.fontWeight.value = s.fontWeight;
    els.fontFamily.value = s.fontFamily;
    els.textColor.value = s.textColor;
    els.nameColor.value = s.nameColor;
    els.nameSize.value = String(s.nameSize);
    els.showDebug.checked = s.showDebug;
}
export function readComment() {
    return {
        name: els.nameText.value,
        text: els.commentText.value,
    };
}
export function getUploadEl() {
    return els.bgUpload;
}
export function onChange(callback) {
    const inputs = [
        els.commentText, els.nameText, els.nameSize,
        els.boxX, els.boxY, els.boxW, els.boxH,
        els.padding, els.lineHeight,
        els.maxFontSize, els.minFontSize,
        els.fontWeight, els.fontFamily,
        els.textColor, els.nameColor,
        els.showDebug,
    ];
    for (const el of inputs) {
        el.addEventListener('input', callback);
        el.addEventListener('change', callback);
    }
}
