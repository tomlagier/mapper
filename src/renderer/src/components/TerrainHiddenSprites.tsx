import { Container, Sprite } from '@pixi/react'
import { useCircle } from '@renderer/hooks/useCircle'
import {
  BlurFilter,
  Graphics,
  MASK_TYPES,
  MaskData,
  Container as PixiContainer,
  Rectangle
} from 'pixi.js'
import { useState, useEffect, RefObject } from 'react'

/**
 * Draws the hidden sprites used to render the circles for the terrain brush
 */
const blurFilter = new BlurFilter()

interface TerrainHiddenSpritesProps {
  containerRef: RefObject<PixiContainer>
  hiddenSprites: number[][]
}
export function TerrainHiddenSprites({ containerRef, hiddenSprites }: TerrainHiddenSpritesProps) {
  // Texture to render a single circle
  const circleTexture = useCircle()
  const [mask, setMask] = useState<MaskData | null>(null)

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    const maskGraphic = new Graphics()
    maskGraphic.beginFill(0xffffff)
    maskGraphic.drawRect(0, 0, 512, 512)
    const mask = new MaskData(maskGraphic)
    mask.type = MASK_TYPES.SCISSOR
    setMask(mask)
  }, [])

  return (
    <Container ref={containerRef} filters={[blurFilter]} mask={mask}>
      {mounted &&
        hiddenSprites.map(([x, y, size], i) => {
          return (
            <Sprite
              x={x}
              y={y}
              scale={size}
              key={i}
              tint="white"
              alpha={0.3}
              texture={circleTexture}
              zIndex={-9999}
            />
          )
        })}
    </Container>
  )
}
