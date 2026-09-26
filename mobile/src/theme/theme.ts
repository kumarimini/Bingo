export const colors = {
  bg: '#0F1024',
  bgAlt: '#171933',
  surface: '#20223F',
  surfaceAlt: '#2A2D52',
  primary: '#7C5CFC',
  primaryDark: '#5B3FD6',
  accent: '#FF6B9D',
  gold: '#FFC24B',
  success: '#3DDC97',
  danger: '#FF5C7A',
  text: '#F5F5FF',
  textMuted: '#9A9CC0',
  cellEmpty: '#2A2D52',
  cellFilled: '#12132A',
  cellCalled: '#4A3F8F',
  cellMarked: 'rgba(255,255,255,0.06)',
  border: '#3A3D6A',
  strike: '#FFFFFF',
  winLine: '#FFFFFF',
};

// One distinct, vibrant color per B-I-N-G-O column.
export const columnColors: Record<'B' | 'I' | 'N' | 'G' | 'O', string> = {
  B: '#FF6B6B',
  I: '#FFB020',
  N: '#2DD4BF',
  G: '#4D96FF',
  O: '#B47CFF',
};

export const spacing = (n: number) => n * 8;

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
};

export const font = {
  h1: 32,
  h2: 24,
  h3: 18,
  body: 15,
  small: 12,
};

export const shadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.3,
  shadowRadius: 10,
  elevation: 6,
};
