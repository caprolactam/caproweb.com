export const ColorMode = {
  Dark: 'dark',
  Light: 'light',
} as const

export type ColorMode = (typeof ColorMode)[keyof typeof ColorMode]
