export function isInView(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect()

  if (!window.visualViewport) return false

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    // Need + 40 for safari detection
    rect.bottom <= window.visualViewport.height - 40 &&
    rect.right <= window.visualViewport.width
  )
}

export function getTranslateScale(element: HTMLElement): number | null {
  const style = window.getComputedStyle(element)
  const transform =
    // @ts-ignore
    style.transform || style.webkitTransform || style.mozTransform
  let mat = transform.match(/^matrix3d\((.+)\)$/)
  if (mat) {
    // https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix3d
    return parseFloat(mat[1].split(', ')[0])
  }
  // https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix
  mat = transform.match(/^matrix\((.+)\)$/)
  return mat ? parseFloat(mat[1].split(', ')[0]) : null
}

export function dampenValue(v: number) {
  return 10 * (Math.log(v + 1) - 2)
}
