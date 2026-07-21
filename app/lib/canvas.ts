export function setupCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!

  const canvasDimensions = {
    width: 0,
    height: 0,
  }

  function update() {
    const dpr = window.devicePixelRatio
    const { width, height } = canvas.getBoundingClientRect()

    canvas.setAttribute('width', String(width * dpr))
    canvas.setAttribute('height', String(height * dpr))

    ctx.scale(dpr, dpr)

    canvasDimensions.width = width
    canvasDimensions.height = height
  }

  // Call `update` whenever the window is resized:
  window.addEventListener('resize', update)

  // Also call it immediately, to do the initial
  // calculations and setup work:
  update()

  return { ctx, canvasDimensions }
}
