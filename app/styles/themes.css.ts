import {
  createGlobalThemeContract,
  createGlobalTheme,
  style,
} from '@vanilla-extract/css'

export const vars = createGlobalThemeContract({
  color: {
    brand: 'color-brand',
  },
  font: {
    body: 'font-body',
  },
})

createGlobalTheme(':root', vars, {
  color: {
    brand: 'blue',
  },
  font: {
    body: 'arial',
  },
})

export const brandText = style({
  color: vars.color.brand,
  fontFamily: vars.font.body,
})
