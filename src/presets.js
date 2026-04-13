const STORAGE_KEY = 'comment-gen-presets';
const DEFAULT_PRESET = {
    name: 'DB6567 デフォルト',
    readonly: true,
    settings: {
        box: { x: 160, y: 210, w: 720, h: 220 },
        padding: 22,
        lineHeight: 1.25,
        maxFontSize: 54,
        minFontSize: 20,
        fontWeight: '700',
        fontFamily: '"Noto Sans JP Variable", "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif',
        textColor: '#3A2326',
        nameColor: '#DB6567',
        nameSize: 28,
        showDebug: false,
    },
};
function stored() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    }
    catch {
        return [];
    }
}
function persist(presets) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}
export function loadPresets() {
    return [DEFAULT_PRESET, ...stored()];
}
export function savePreset(name, settings) {
    const others = stored().filter(p => p.name !== name);
    persist([...others, { name, settings }]);
}
export function deletePreset(name) {
    persist(stored().filter(p => p.name !== name));
}
