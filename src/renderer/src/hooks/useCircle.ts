import { useApp } from '@pixi/react'
import { useEffect, useRef } from 'react'
import { MSAA_QUALITY, Matrix, RenderTexture, Graphics as PixiGraphics } from 'pixi.js'

// Creates a circle texture that can be reused efficiently as a texture by sprites
export function useCircle() {
  const app = useApp()
  const circle = useRef<RenderTexture>()

  useEffect(() => {
    if (!app) return

    const templateShape = new PixiGraphics().beginFill(0xffffff).drawCircle(0, 0, 10)

    const { width, height } = templateShape

    // Draw the circle to the RenderTexture
    const renderTexture = RenderTexture.create({
      width,
      height,
      multisample: MSAA_QUALITY.HIGH,
      resolution: window.devicePixelRatio
    })
    // With the existing renderer, render texture
    // make sure to apply a transform Matrix
    app.renderer.render(templateShape, {
      renderTexture,
      transform: new Matrix(1, 0, 0, 1, width / 2, height / 2)
    })

    // Not sure if this is necessary
    app.renderer.framebuffer.blit()

    circle.current = renderTexture

    // Discard the original Graphics
    templateShape.destroy(true)
  }, [app])

  return circle.current
}
