import { Sprite, Stage, Container } from '@pixi/react'
import { Tools } from '../utils/tools'
import { TerrainBrush } from './TerrainBrush'
import { useEffect, useRef, useState } from 'react'
import { LayerTypes, MapState, UiState } from '@renderer/types/state'
import {
  Application,
  Container as PixiContainer,
  Filter,
  Rectangle,
  Texture,
  MaskData,
  Graphics,
  MASK_TYPES
} from 'pixi.js'
import { PixiViewport } from './Viewport'
import { Viewport } from 'pixi-viewport'
import { UndoCommand } from '@renderer/utils/undo'
import { UpdateLayers } from '@renderer/hooks/useAppState'
import { Stratas } from '@renderer/types/stratas'
import { TerrainHiddenSprites } from './TerrainHiddenSprites'

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
  updateLayers: UpdateLayers
  pushUndo: (undo: UndoCommand) => void
  setApp: (app: Application) => void
}

export function PixiCanvas({ uiState, mapState, updateLayers, pushUndo, setApp }: PixiCanvasProps) {
  const [cursor, setCursor] = useState('default')

  // Get the viewport instance
  const viewportRef = useRef<Viewport>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [mounted, setMounted] = useState(false)
  const [stageSize, setStageSize] = useState<DOMRect | null | undefined>(null)

  const worldWidth = mapState.width
  const worldHeight = mapState.height

  useEffect(() => {
    setMounted(true)
  }, [])

  // Used to coordinate the hidden sprites with the updated layer textures
  const [hiddenSprites, setHiddenSprites] = useState<number[][]>([])
  const hiddenSpriteContainerRef = useRef<PixiContainer>(null)

  useEffect(() => {
    if (!mounted) return

    setStageSize(containerRef.current?.getBoundingClientRect())

    const handleResize = () => {
      setStageSize(containerRef.current?.getBoundingClientRect())
    }

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [mounted])

  return (
    <div style={{ cursor, width: '100%', height: '100%', overflow: 'hidden' }} ref={containerRef}>
      {mounted && stageSize && (
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          options={{ antialias: true, resolution: 2, backgroundColor: 0x333333 }}
          onMount={setApp}
        >
          <PixiViewport
            ref={viewportRef}
            screenWidth={stageSize.width}
            screenHeight={stageSize.height}
            worldWidth={worldWidth}
            worldHeight={worldHeight}
          >
            {/** Hidden layer for tool workings */}
            {uiState.activeTool === Tools.TERRAIN && (
              <TerrainHiddenSprites
                containerRef={hiddenSpriteContainerRef}
                hiddenSprites={hiddenSprites}
              />
            )}

            {/** Visible layers */}
            {mapState.layerOrder.map((layerId, index) => {
              const layer = mapState.layers[layerId]

              // TODO: Support Object layers
              if (layer.type !== LayerTypes.TERRAIN) return

              const filters: Filter[] = []
              const brush = mapState.terrainBrushes[layer.brush]
              if (brush.filter) filters.push(brush.filter)

              return (
                <Sprite
                  key={layerId}
                  x={0}
                  y={0}
                  width={worldWidth}
                  height={worldHeight}
                  texture={layer.texture || Texture.EMPTY}
                  eventMode="static"
                  zIndex={Stratas.BACKGROUND}
                  filters={filters}
                />
              )
            })}

            {/** Tool layer */}
            {uiState.activeTool === Tools.TERRAIN && (
              <TerrainBrush
                width={worldWidth}
                height={worldHeight}
                setCursor={setCursor}
                pushUndo={pushUndo}
                mapState={mapState}
                activeFill={uiState.activeFill}
                updateLayers={updateLayers}
                viewport={viewportRef.current!}
                hiddenSprites={hiddenSprites}
                setHiddenSprites={setHiddenSprites}
                hiddenSpriteContainer={hiddenSpriteContainerRef}
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
