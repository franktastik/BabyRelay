export const colors = {
  sage: '#8DA089',
  sageText: '#6B7B68',
  softSage: '#F2F4F1',
  clay: '#D98E73',
  softClay: '#FDF4F1',
  gold: '#E5C36E',
  cream: '#FAF9F6',
  creamAlt: '#F7F0E6',
  stone: '#F8F7F4',
  border: '#EAE3D9',
  ink: '#2C2C2C',
  inkLight: '#4A4A4A',
  stoneText: '#44403C',
  muted: '#9A9590',
  mutedLight: '#B7B0A8',
  danger: '#C46B5E',
  white: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.3)',
} as const

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  base: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 28,
  xxxl: 32,
  full: 9999,
} as const

export const typography = {
  h1: {
    fontSize: 24,
    fontWeight: '800' as const,
    lineHeight: 30,
    fontFamily: 'Outfit_800ExtraBold',
  },
  h2: {
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 26,
    fontFamily: 'Outfit_700Bold',
  },
  h3: {
    fontSize: 17,
    fontWeight: '700' as const,
    lineHeight: 22,
    fontFamily: 'Outfit_700Bold',
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  action: {
    fontSize: 14,
    fontWeight: '700' as const,
    lineHeight: 18,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  label: {
    fontSize: 11,
    fontWeight: '700' as const,
    lineHeight: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
} as const

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 18,
    elevation: 4,
  },
} as const

export type BabyMinimoColors = typeof colors
export type BabyMinimoSpacing = typeof spacing
export type BabyMinimoRadius = typeof radius
export type BabyMinimoTypography = typeof typography
export type BabyMinimoShadows = typeof shadows
