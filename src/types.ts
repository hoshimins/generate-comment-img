export interface BoxGeometry {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface RenderSettings {
  box: BoxGeometry;
  padding: number;
  lineHeight: number;
  maxFontSize: number;
  minFontSize: number;
  fontWeight: '400' | '700' | '900';
  fontFamily: string;
  textColor: string;
  nameColor: string;
  nameSize: number;
  showDebug: boolean;
  renderMode: 'overlay' | 'bubble';
  bubbleBg: string;
  bubbleBorderColor: string;
  bubbleTailSide: 'left' | 'right';
  avatarSize: number;
  bubbleMaxWidth: number;
  showBubbleName: boolean;
  bubbleRadius: number;
}

export interface CommentData {
  name: string;
  text: string;
}

export interface Preset {
  name: string;
  settings: RenderSettings;
  readonly?: boolean;
}
