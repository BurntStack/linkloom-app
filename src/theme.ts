// Linkloom design system.
export const BRAND = 'Linkloom';

const LIGHT_COLORS: Record<string, string> = {
  bg: '#FFFFFF',
  white: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSoft: '#F7F7F9',
  surfaceSubtle: '#FBFBFC',
  surfaceContainer: '#F7F7F9',
  surfacePressed: '#F1EEFF',

  dark: '#1C1C21',
  darkSurface: '#28282E',
  darkSurfaceElevated: '#34343B',
  darkBorder: '#45454D',
  darkMuted: '#B9B9C1',

  text: '#1D1D22',
  textSecondary: '#4C4C55',
  muted: '#777780',
  muted2: '#62626B',
  muted3: '#A3A3AB',
  mutedLight: '#D4D4D9',

  border: '#DEDEE3',
  border2: '#C9C9D0',
  borderSubtle: '#F0F0F2',
  tabBorder: '#E7E7EA',

  primary: '#7866F5',
  primaryHover: '#8D7DFF',
  primaryPressed: '#6350E8',
  primaryLight: '#F1EFFF',
  primaryGlow: 'rgba(120, 102, 245, 0.12)',
  accent: '#F34A73',
  accentSoft: '#FFF0F4',
  lavender: '#F1EFFF',
  cta: '#FFF16A',
  ctaPressed: '#F3E35B',
  onCta: '#1D1D22',
  creatorAccent: '#F34A73',
  brandAccent: '#7866F5',

  pink: '#E11D48',
  pinkBg: '#FFF1F2',
  pinkBg2: '#FFE4E6',
  pinkText: '#BE123C',

  green: '#168A5B',
  logoGreen: '#F34A73',
  greenBg: '#E8F7EF',
  emerald: '#168A5B',
  emeraldBg: '#E8F7EF',

  amber: '#B27A00',
  amberBg: '#FFF7D6',
  gold: '#F2D740',

  red: '#DC2626',
  redBg: '#FEE2E2',

  blue: '#0284C7',
  blueBg: '#E0F2FE',

  indigo: '#7866F5',
  indigoBg: '#F1EFFF',

  onPrimary: '#FFFFFF',
  onDark: '#FFFFFF',
  onDarkMuted: '#B9B9C1',
  overlay: 'rgba(17, 17, 22, 0.58)',
  darkAccent: 'rgba(243, 74, 115, 0.2)',
  darkDivider: 'rgba(255, 255, 255, 0.14)',
  primaryBorder: 'rgba(120, 102, 245, 0.24)',
  ripple: 'rgba(120, 102, 245, 0.08)',
  rippleWhite: 'rgba(255, 255, 255, 0.18)',
  rippleDark: 'rgba(29, 29, 34, 0.06)',
  subtleBorder: 'rgba(29, 29, 34, 0.04)',
};

const DARK_COLORS: Record<string, string> = {
  ...LIGHT_COLORS,
  bg: '#151519',
  surface: '#1F1F24',
  surfaceSoft: '#29292F',
  surfaceSubtle: '#29292F',
  surfaceContainer: '#29292F',
  surfacePressed: '#393344',

  dark: '#1F1F24',
  darkSurface: '#29292F',
  darkSurfaceElevated: '#39393F',
  darkBorder: '#45454D',
  darkMuted: '#B9B9C1',

  text: '#F6F6F8',
  textSecondary: '#D0D0D5',
  muted: '#B5B5BE',
  muted2: '#C3C3CA',
  muted3: '#85858F',
  mutedLight: '#66666E',

  border: '#424249',
  border2: '#515159',
  borderSubtle: '#303037',
  tabBorder: '#38383F',

  primary: '#A99CFF',
  primaryHover: '#B8AEFF',
  primaryPressed: '#8D7DFF',
  primaryLight: '#332F49',
  primaryGlow: 'rgba(169, 156, 255, 0.16)',
  accent: '#FF7897',
  accentSoft: '#3A2530',
  lavender: '#332F49',
  cta: '#FFF16A',
  ctaPressed: '#F3E35B',
  onCta: '#1D1D22',
  creatorAccent: '#FF7897',
  brandAccent: '#A99CFF',

  pink: '#FB7185',
  pinkBg: '#3A1D29',
  pinkBg2: '#4C1D2D',
  pinkText: '#FDA4AF',

  green: '#5DCA91',
  logoGreen: '#FF7897',
  greenBg: '#26392E',
  emerald: '#5DCA91',
  emeraldBg: '#26392E',

  amber: '#FBBF24',
  amberBg: '#3A2D12',
  gold: '#FBBF24',

  red: '#F87171',
  redBg: '#3A1D1D',

  blue: '#38BDF8',
  blueBg: '#142C36',

  indigo: '#A99CFF',
  indigoBg: '#332F49',

  onPrimary: '#FFFFFF',
  onDark: '#F6F6F8',
  onDarkMuted: '#B9B9C1',
  overlay: 'rgba(0, 0, 0, 0.68)',
  darkAccent: 'rgba(255, 120, 151, 0.16)',
  darkDivider: 'rgba(208, 208, 213, 0.18)',
  primaryBorder: 'rgba(169, 156, 255, 0.28)',
  ripple: 'rgba(169, 156, 255, 0.1)',
  rippleWhite: 'rgba(246, 246, 248, 0.14)',
  rippleDark: 'rgba(0, 0, 0, 0.12)',
  subtleBorder: 'rgba(208, 208, 213, 0.12)',
};

export const C: Record<string, string> = { ...LIGHT_COLORS };

export function setColorScheme(scheme: 'light' | 'dark') {
  Object.assign(C, scheme === 'dark' ? DARK_COLORS : LIGHT_COLORS);
}

export const F = {
  reg: 'Inter_400Regular',
  med: 'Inter_500Medium',
  semi: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  xbold: 'Inter_800ExtraBold',
};

export const TYPO = {
  hero: 26,
  h1: 24,
  h2: 19,
  title: 16,
  body: 14.5,
  sub: 13.5,
  caption: 12,
  micro: 11,
};

export const shadow = {
  shadowColor: '#0F172A',
  shadowOpacity: 0.035,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 1,
};

export const shadowSm = {
  shadowColor: '#0F172A',
  shadowOpacity: 0.03,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
};

export const shadowMd = {
  shadowColor: '#0F172A',
  shadowOpacity: 0.05,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 3 },
  elevation: 2,
};

export const shadowLg = {
  shadowColor: '#0F172A',
  shadowOpacity: 0.08,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
};

export function inr(n: number): string {
  const s = Math.round(n).toString();
  if (s.length <= 3) return '₹' + s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return '₹' + rest + ',' + last3;
}
