import { style } from '@vanilla-extract/css'

export const sidebarContainer = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '8px',
})

export const tagFilterSection = style({
  flex: '1 1 320px',
})

export const contentsSection = style({
  flex: '9999 1 0%',
  minWidth: '50%',
})
