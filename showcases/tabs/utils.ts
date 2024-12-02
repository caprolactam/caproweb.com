import React from 'react'
import { useIsomorphicLayoutEffect } from '../utils/misc.ts'

export function getTranslate(element: HTMLElement): number | null {
  const style = window.getComputedStyle(element)
  const transform =
    // @ts-ignore
    style.transform || style.webkitTransform || style.mozTransform
  let mat = transform.match(/^matrix3d\((.+)\)$/)
  if (mat) {
    // https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix3d
    return parseFloat(mat[1].split(', ')[12])
  }
  // https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix
  mat = transform.match(/^matrix\((.+)\)$/)
  return mat ? parseFloat(mat[1].split(', ')[4]) : null
}

export function dampenValue(v: number) {
  return 8 * (Math.log(v + 1) - 2)
}

/**
 * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
 *
 * @param {String} text The text to be rendered.
 * @param {String} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
 *
 * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
 */
export function getTextWidth(text: string, font: string) {
  // re-use canvas object for better performance
  // @ts-ignore
  const canvas = (getTextWidth.canvas ||
    // @ts-ignore
    (getTextWidth.canvas =
      document.createElement('canvas'))) as HTMLCanvasElement
  const context = canvas.getContext('2d')
  if (!context) return 0
  context.font = font
  const metrics = context.measureText(text)
  return metrics.width
}

function getCssStyle(element: Element, prop: string) {
  return window.getComputedStyle(element, null).getPropertyValue(prop)
}

export function getCanvasFont(el = document.body) {
  const fontWeight = getCssStyle(el, 'font-weight') || 'normal'
  const fontSize = getCssStyle(el, 'font-size') || '16px'
  const fontFamily =
    getCssStyle(el, 'font-family') ||
    '-apple-system, BlinkMacSystemFont, "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", Meiryo, sans-serif'

  return `${fontWeight} ${fontSize} ${fontFamily}`
}

export const useScheduleLayoutEffect = () => {
  const [s, ss] = React.useState<readonly []>()
  const fns = React.useRef<Map<string | number, () => void>>(
    new Map() as Map<string | number, () => void>,
  )

  useIsomorphicLayoutEffect(() => {
    fns.current.forEach((f) => f())
    fns.current = new Map() as Map<string | number, () => void>
  }, [s])

  return React.useCallback((id: string | number, cb: () => void) => {
    fns.current.set(id, cb)
    ss([])
  }, [])
}
