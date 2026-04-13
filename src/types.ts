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
