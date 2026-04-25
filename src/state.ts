import type { RenderSettings, CommentData } from './types';

function getEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element #${id} not found`);
  return el as T;
}

const els = {
  bgUpload:       getEl<HTMLInputElement>('bgUpload'),
  avatarUpload:   getEl<HTMLInputElement>('avatarUpload'),
  commentText:    getEl<HTMLTextAreaElement>('commentText'),
  nameText:       getEl<HTMLInputElement>('nameText'),
  nameSize:       getEl<HTMLInputElement>('nameSize'),
  boxX:           getEl<HTMLInputElement>('boxX'),
  boxY:           getEl<HTMLInputElement>('boxY'),
  boxW:           getEl<HTMLInputElement>('boxW'),
  boxH:           getEl<HTMLInputElement>('boxH'),
  padding:        getEl<HTMLInputElement>('padding'),
  lineHeight:     getEl<HTMLInputElement>('lineHeight'),
  maxFontSize:    getEl<HTMLInputElement>('maxFontSize'),
  minFontSize:    getEl<HTMLInputElement>('minFontSize'),
  fontWeight:     getEl<HTMLSelectElement>('fontWeight'),
  fontFamily:     getEl<HTMLSelectElement>('fontFamily'),
  textColor:      getEl<HTMLInputElement>('textColor'),
  nameColor:      getEl<HTMLInputElement>('nameColor'),
  showDebug:      getEl<HTMLInputElement>('showDebug'),
  bubbleBg:          getEl<HTMLInputElement>('bubbleBg'),
  bubbleBorderColor: getEl<HTMLInputElement>('bubbleBorderColor'),
  bubbleTailSide:    getEl<HTMLSelectElement>('bubbleTailSide'),
  avatarSize:        getEl<HTMLInputElement>('avatarSize'),
  bubbleMaxWidth:    getEl<HTMLInputElement>('bubbleMaxWidth'),
  showBubbleName:    getEl<HTMLInputElement>('showBubbleName'),
  bubbleRadius:      getEl<HTMLInputElement>('bubbleRadius'),
};

function num(el: HTMLInputElement): number {
  return Number(el.value || 0);
}

function getRenderMode(): 'overlay' | 'bubble' {
  const checked = document.querySelector('input[name="renderMode"]:checked') as HTMLInputElement | null;
  return (checked?.value ?? 'overlay') as 'overlay' | 'bubble';
}

export function readSettings(): RenderSettings {
  return {
    box: {
      x: num(els.boxX),
      y: num(els.boxY),
      w: num(els.boxW),
      h: num(els.boxH),
    },
    padding:        num(els.padding),
    lineHeight:     Number(els.lineHeight.value),
    maxFontSize:    num(els.maxFontSize),
    minFontSize:    num(els.minFontSize),
    fontWeight:     els.fontWeight.value as '400' | '700' | '900',
    fontFamily:     els.fontFamily.value,
    textColor:      els.textColor.value,
    nameColor:      els.nameColor.value,
    nameSize:       num(els.nameSize),
    showDebug:      els.showDebug.checked,
    renderMode:        getRenderMode(),
    bubbleBg:          els.bubbleBg.value,
    bubbleBorderColor: els.bubbleBorderColor.value,
    bubbleTailSide:    els.bubbleTailSide.value as 'left' | 'right',
    avatarSize:        num(els.avatarSize),
    bubbleMaxWidth:    num(els.bubbleMaxWidth),
    showBubbleName:    els.showBubbleName.checked,
    bubbleRadius:      num(els.bubbleRadius),
  };
}

export function writeSettings(s: RenderSettings): void {
  els.boxX.value        = String(s.box.x);
  els.boxY.value        = String(s.box.y);
  els.boxW.value        = String(s.box.w);
  els.boxH.value        = String(s.box.h);
  els.padding.value     = String(s.padding);
  els.lineHeight.value  = String(s.lineHeight);
  els.maxFontSize.value = String(s.maxFontSize);
  els.minFontSize.value = String(s.minFontSize);
  els.fontWeight.value  = s.fontWeight;
  els.fontFamily.value  = s.fontFamily;
  els.textColor.value   = s.textColor;
  els.nameColor.value   = s.nameColor;
  els.nameSize.value    = String(s.nameSize);
  els.showDebug.checked = s.showDebug;
  // bubble fields
  els.bubbleBg.value          = s.bubbleBg;
  els.bubbleBorderColor.value = s.bubbleBorderColor;
  els.bubbleTailSide.value    = s.bubbleTailSide;
  els.avatarSize.value        = String(s.avatarSize);
  els.bubbleMaxWidth.value    = String(s.bubbleMaxWidth);
  els.showBubbleName.checked  = s.showBubbleName;
  els.bubbleRadius.value      = String(s.bubbleRadius);
  const radio = document.querySelector(`input[name="renderMode"][value="${s.renderMode}"]`) as HTMLInputElement | null;
  if (radio) radio.checked = true;
}

export function readComment(): CommentData {
  return {
    name: els.nameText.value,
    text: els.commentText.value,
  };
}

export function getUploadEl(): HTMLInputElement {
  return els.bgUpload;
}

export function getAvatarUploadEl(): HTMLInputElement {
  return els.avatarUpload;
}

export function onChange(callback: () => void): void {
  const inputs: (HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)[] = [
    els.commentText, els.nameText, els.nameSize,
    els.boxX, els.boxY, els.boxW, els.boxH,
    els.padding, els.lineHeight,
    els.maxFontSize, els.minFontSize,
    els.fontWeight, els.fontFamily,
    els.textColor, els.nameColor,
    els.showDebug,
    els.bubbleBg, els.bubbleBorderColor, els.bubbleTailSide, els.avatarSize,
    els.bubbleMaxWidth, els.showBubbleName, els.bubbleRadius,
  ];
  for (const el of inputs) {
    el.addEventListener('input', callback);
    el.addEventListener('change', callback);
  }
  // radio buttons
  document.querySelectorAll('input[name="renderMode"]').forEach(el => {
    el.addEventListener('change', callback);
  });
}
