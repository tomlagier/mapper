import { Sprite, Stage } from '@pixi/react'
import { TOOLS, TOOL } from '../utils/tools'
import { TerrainBrush } from './TerrainBrush'
import { useUndo } from '@renderer/utils/undo'
import { useEffect, useRef, useState } from 'react'
import { FillTexture, MapState, UiState } from '@renderer/types/state'
import { Texture } from 'pixi.js'
import { STRATAS } from '@renderer/types/stratas'
import { PixiViewport } from './Viewport'
import { Viewport } from 'pixi-viewport'

// Basic algorithm for brush:
// - Maintain mapping of color to texture
// - On mouse down, depending on scatter, paint color that references the texture onto canvas
// - When rendering canvas, look up color in mapping and render texture by pixel coordinates, looping
//    where necessary
// - Inputs: texture array, array index, mouse position, backing pixel array
// - Outputs: Rendered raster image of background
interface PixiCanvasProps {
  uiState: UiState
  mapState: MapState
  setFillTextures: (fillTextures: Record<string, Partial<FillTexture>>) => void
}

export function PixiCanvas({ uiState, mapState, setFillTextures }: PixiCanvasProps) {
  const [cursor, setCursor] = useState('default')
  const { push } = useUndo()
  // Get the viewport instance
  const viewportRef = useRef<Viewport>()

  const containerRef = useRef<HTMLDivElement>(null)

  const [mounted, setMounted] = useState(false)
  const [stageSize, setStageSize] = useState<DOMRect | null | undefined>(null)
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    setStageSize(containerRef.current?.getBoundingClientRect())

    const handleResize = () => {
      setStageSize(containerRef.current?.getBoundingClientRect())
    }

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [mounted])

  const worldWidth = 512
  const worldHeight = 512

  return (
    <div style={{ cursor, width: '100%', height: '100%', overflow: 'hidden' }} ref={containerRef}>
      {mounted && stageSize && (
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          options={{ antialias: true, resolution: 2 }}
        >
          {/** Background strata */}
          <PixiViewport
            ref={viewportRef}
            screenWidth={stageSize.width}
            screenHeight={stageSize.height}
            worldWidth={worldWidth}
            worldHeight={worldHeight}
          >
            {/* <Sprite
            width={width}
            height={height}
            texture={Texture.WHITE}
            eventMode="static"
            pointerdown={(e) => console.log(e)}
          /> */}
            {uiState.activeTool === TOOLS.TERRAIN_BRUSH && (
              <TerrainBrush
                width={worldWidth}
                height={worldWidth}
                setCursor={setCursor}
                pushUndo={push}
                mapState={mapState}
                setFillTextures={setFillTextures}
                activeFill={uiState.activeFill}
                viewport={viewportRef.current!}
              />
            )}

            {/** Object strata */}

            {/** Tool strata */}

            {/** UI strata */}
          </PixiViewport>
        </Stage>
      )}
    </div>
  )
}
