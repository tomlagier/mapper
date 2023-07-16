import { Sprite, useApp } from '@pixi/react'
import { useEffect, useState, RefObject } from 'react'
import { getSplatterCircles } from '@renderer/utils/circles'
import {
  Texture,
  RenderTexture,
  MSAA_QUALITY,
  Sprite as PixiSprite,
  Application,
  Container
} from 'pixi.js'
import { UndoCommand } from '@renderer/utils/undo'
import { Layer, LayerTypes, MapState, TerrainLayer } from '@renderer/types/state'
import { Point, getNormalizedMagnitude, interpolate } from '@renderer/utils/interpolate'
import { Viewport } from 'pixi-viewport'
import { RENDER_TERRAIN_DEBUG } from '@renderer/config'
import { UpdateLayers } from '@renderer/hooks/useAppState'
import { clampUseMovePosition } from '@mantine/hooks'

interface TerrainBrushProps {
  width: number
  height: number
  // Eventually we'll use this to control the cursor size
  setCursor: (cursor: string) => void
  // Push command onto the undo stack
  pushUndo: (command: UndoCommand) => void
  // Map state
  mapState: MapState
  activeLayer: string
  viewport: Viewport
  updateLayers: UpdateLayers
  hiddenSprites: number[][]
  setHiddenSprites: (cb: (c: number[][]) => number[][]) => void
  hiddenSpriteContainer: RefObject<Container>
}

export function TerrainBrush({
  width,
  height,
  // setCursor,
  pushUndo,
  mapState,
  activeLayer,
  updateLayers,
  viewport,
  hiddenSprites,
  setHiddenSprites,
  hiddenSpriteContainer
}: TerrainBrushProps) {
  // Eventually these will be controlled by the UI layer
  const size = 1
  const splatterRadius = 100
  const splatterAmount = 15

  const app = useApp()
  const [prevTex, _setPrevTex] = useState<Record<string, Partial<TerrainLayer>>>({})

  // Save a simpler texMap of previous textures, used for undo state
  const setPrevTex = () => {
    const prev = renderUndoTextures({ width, height, app, layers: mapState.layers })
    _setPrevTex(() => prev)
  }

  // Update our render texture with the batch of circles drawn since the last save.
  const saveTexture = async () => {
    if (hiddenSprites.length === 0) return

    // We fill the active texture's layer with white circles, which our filter maps to the correct texture
    const layer = Object.values(mapState.layers).find((l) => l.id === activeLayer)

    if (!layer || layer.type !== LayerTypes.TERRAIN) return

    const container = hiddenSpriteContainer?.current
    app.renderer.render(container!, {
      renderTexture: layer.texture,
      blit: true,
      clear: false
    })

    if (RENDER_TERRAIN_DEBUG) {
      app.renderer.extract.base64(layer.texture, 'image/webp', 1).then((canvas) =>
        updateLayers({
          [layer.id]: { canvas }
        })
      )
    }
    // console.log(`Render end ${id}`)

    setHiddenSprites(() => [])
  }

  // Save circles to texture when added
  // const limit = 25
  useEffect(() => {
    if (hiddenSprites.length === 0) return
    saveTexture()
  }, [hiddenSprites.length])

  // Because the sample pointermove sample rate is kinda low, we use interpolation to render
  // circles between ticks of pointermove. This tracks that state.
  const [lastCircleSpot, setLastCircleSpot] = useState<Point>()
  const paintInterval = 5 * (viewport?.scale.x || 1)

  // Callback for undo/redo that clones the undo/redo state and sets it as the current texture state.
  // We clone b/c otherwise we draw on the textures in the undo/redo stack which leads to incorrect
  // behavior when redoing then drawing then undoing & redoing again.
  const cloneAndSetTextures = (layers: Record<string, Partial<TerrainLayer>>) => {
    const nextTextures = renderUndoTextures({
      app,
      width,
      height,
      layers
    })
    updateLayers(nextTextures)
  }

  return (
    <>
      {/** This container tracks the pointer events used to paint and stop painting. */}
      <Sprite
        eventMode="static"
        x={0}
        y={0}
        width={width}
        height={height}
        texture={Texture.EMPTY}
        pointermove={(e) => {
          // 1 = left click
          if (e.buttons !== 1) return

          // This is our start point that we interpolate from, towards the current mouse position
          const originalX = lastCircleSpot?.x || e.global.x
          const originalY = lastCircleSpot?.y || e.global.y

          // These are the interstital points that we paint between originalX/Y and the pointer
          const lastDrawn = { x: originalX, y: originalY }

          // Distance in px between the last time we drew circles and the current mouse position
          let distance = Math.sqrt(
            Math.pow(e.global.x - lastDrawn.x, 2) + Math.pow(e.global.y - lastDrawn.y || 0, 2)
          )

          // Normalized magnitude of the distance between the last drawn point and the current mouse
          const magnitude = getNormalizedMagnitude({
            startPoint: lastCircleSpot || e.global,
            endPoint: e.global
          })

          // Circles we're going to add to the canvas
          const _c: number[][] = []
          while (distance && distance > paintInterval) {
            distance -= paintInterval

            // Generates a point on the line between origialX/Y and the current mouse position that
            // is paintInterval px away from the last drawn point.
            const { x, y } = interpolate({ point: lastDrawn, magnitude, stepSize: paintInterval })

            // Get circles from that point
            const newCircles = getSplatterCircles({
              x,
              y,
              splatterRadius,
              splatterAmount,
              size,
              viewport
            })

            _c.push(...newCircles)

            // Update our last drawn point
            lastDrawn.x = x
            lastDrawn.y = y
          }

          if (_c.length) {
            setHiddenSprites((c) => [...c, ..._c])
          }

          if (lastDrawn.x !== originalX || lastDrawn.y !== originalY) {
            setLastCircleSpot(lastDrawn)
          }
        }}
        pointerdown={async (e) => {
          // Push the current terrain textures to the undo stack
          setPrevTex()
          setLastCircleSpot(() => ({ ...e.global }))

          if (e.button !== 1) return

          const newCircles = getSplatterCircles({
            x: e.global.x,
            y: e.global.y,
            splatterRadius,
            splatterAmount,
            size,
            viewport
          })

          setHiddenSprites((c) => [...c, ...newCircles])
        }}
        pointerup={async () => {
          // Complete our interpolation, save any outstanding circles to textures, then push
          // textures to undo stack.
          await saveTexture()
          const currTex = renderUndoTextures({
            app,
            width,
            height,
            layers: mapState.layers
          })
          pushUndo(new TerrainUndoCommand(prevTex, currTex, cloneAndSetTextures))
        }}
        zIndex={-9999}
      />
    </>
  )
}

class TerrainUndoCommand implements UndoCommand {
  constructor(
    private prevTex: Record<string, Partial<TerrainLayer>>,
    private currTex: Record<string, Partial<TerrainLayer>>,
    private setCurrTex: (tex: Record<string, Partial<TerrainLayer>>) => void
  ) {}

  undo() {
    if (this.prevTex) {
      this.setCurrTex(this.prevTex)
    }
  }

  redo() {
    if (this.currTex) {
      this.setCurrTex(this.currTex)
    }
  }
}

// Given the current fills, creates a map of fill ID to RenderTexture that can be used to undo/redo
// the current canvas state.
interface RenderUndoTexturesArgs {
  layers: Record<string, Partial<Layer>>
  width: number
  height: number
  app: Application
}
function renderUndoTextures({
  layers,
  width,
  height,
  app
}: RenderUndoTexturesArgs): Record<string, Partial<TerrainLayer>> {
  const texMap = {}
  for (const [id, layer] of Object.entries(layers)) {
    if (layer.type !== LayerTypes.TERRAIN) continue

    const renderTexture = RenderTexture.create({
      width,
      height,
      multisample: MSAA_QUALITY.HIGH,
      resolution: window.devicePixelRatio
    })

    app.renderer.render(new PixiSprite(layer.texture), {
      renderTexture,
      blit: true
    })

    texMap[id] = { texture: renderTexture, type: LayerTypes.TERRAIN }
  }

  return texMap
}
