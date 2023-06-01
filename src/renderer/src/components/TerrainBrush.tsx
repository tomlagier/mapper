import { Container, Sprite, useApp } from '@pixi/react'
import { useEffect, useRef, useState } from 'react'
import { getSplatterCircles } from '@renderer/utils/circles'
import {
  Texture,
  Filter,
  RenderTexture,
  MSAA_QUALITY,
  BlurFilter,
  Sprite as PixiSprite,
  Application
} from 'pixi.js'
import { useCircle } from '@renderer/hooks/useCircle'
import { UndoCommand } from '@renderer/utils/undo'
import { FillTexture, MapState } from '@renderer/types/state'
import { STRATAS } from '@renderer/types/stratas'
import { Point, getNormalizedMagnitude, interpolate } from '@renderer/utils/interpolate'
import { Viewport } from 'pixi-viewport'
import { RENDER_TERRAIN_DEBUG } from '@renderer/config'
import { SetFillTextures } from '@renderer/hooks/useAppState'

interface TerrainBrushProps {
  width: number
  height: number
  // Eventually we'll use this to control the cursor size
  setCursor: (cursor: string) => void

  // Push command onto the undo stack
  pushUndo: (command: UndoCommand) => void

  // Map state
  mapState: MapState

  activeFill: string
  setFillTextures: SetFillTextures

  viewport: Viewport
}

const blurFilter = new BlurFilter()

export function TerrainBrush({
  width,
  height,
  // setCursor,
  pushUndo,
  mapState,
  activeFill,
  setFillTextures,
  viewport
}: TerrainBrushProps) {
  // Eventually these will be controlled by the UI layer
  const size = 1
  const splatterRadius = 100
  const splatterAmount = 15

  // Array of circles that are going to be added to the canvas..
  const [circles, setCircles] = useState<Array<Array<number>>>([])

  // Our render texture isn't created until the component is mounted, so we don't render our unsaved
  // circles until then.
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Texture to render a single circle
  const circleTexture = useCircle()

  const app = useApp()
  const [prevTex, _setPrevTex] = useState<Record<string, Partial<FillTexture>>>({})

  // Save a simpler texMap of previous textures, u sed for undo state
  const setPrevTex = () => {
    const prev = renderUndoTextures({ width, height, app, fills: mapState.background.fills })
    _setPrevTex(() => prev)
  }

  // Update our render texture with the batch of circles drawn since the last save.
  const saveTexture = async () => {
    if (circles.length === 0) return

    // We fill the active texture's layer with white circles, and all the other layers
    // with black so we're adding the paint to the correct layer and subtracting it from the
    // rest, allowing us to be layer order agnostic.
    for (const [id, fill] of Object.entries(mapState.background.fills)) {
      // console.log(`Render start ${id}`)
      const isActive = id === activeFill

      const container = isActive ? containerRef.current : inverseContainerRef.current
      app.renderer.render(container!, {
        renderTexture: fill.texture,
        blit: true,
        clear: false
      })

      if (RENDER_TERRAIN_DEBUG) {
        app.renderer.extract.base64(fill.texture, 'image/webp', 1).then((canvas) =>
          setFillTextures({
            [id]: { canvas }
          })
        )
      }
      // console.log(`Render end ${id}`)
    }

    setCircles(() => [])
  }

  // Save circles to texture when added
  // const limit = 25
  useEffect(() => {
    if (circles.length === 0) return
    saveTexture()
  }, [circles.length])

  // Refs for the container we use to render out the circles
  const containerRef = useRef(null)
  const inverseContainerRef = useRef(null)

  // Because the sample pointermove sample rate is kinda low, we use interpolation to render
  // circles between ticks of pointermove. This tracks that state.
  const [lastCircleSpot, setLastCircleSpot] = useState<Point>()
  const paintInterval = 5 * (viewport?.scale.x || 1)

  // Callback for undo/redo that clones the undo/redo state and sets it as the current texture state.
  // We clone b/c otherwise we draw on the textures in the undo/redo stack which leads to incorrect
  // behavior when redoing then drawing then undoing & redoing again.
  const cloneAndSetTextures = (fillTextures: Record<string, Partial<FillTexture>>) => {
    const nextTextures = renderUndoTextures({
      app,
      width,
      height,
      fills: fillTextures
    })
    setFillTextures(nextTextures)
  }

  return (
    <>
      {/**
       * Container that contains our inverse circles, i.e. the black circles we paint
       * on all non-active texture layers */}
      <Container
        ref={inverseContainerRef}
        // TODO: Allow parameterization of the blur
        // Because this is getting applied to the circles, it will get "baked in" to the render
        // texture & can't be dynamically updated for past painted things. If we want to sharpen
        // existing edges, we need to play with the alpha cutoffs that we render stuff at.
        filters={[blurFilter]}
      >
        {mounted &&
          circles.map(([x, y, size], i) => {
            return (
              <Sprite
                x={x}
                y={y}
                scale={size}
                key={i}
                tint="black"
                alpha={0.3}
                texture={circleTexture}
                zIndex={-9999}
              />
            )
          })}
      </Container>
      {/** Container that contains the circles to paint on the active layer */}
      <Container ref={containerRef} filters={[blurFilter]}>
        {mounted &&
          circles.map(([x, y, size], i) => {
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
      {Object.entries(mapState.background.fills).map(([id, fill]) => {
        const filters: Filter[] = []
        if (fill.filter) filters.push(fill.filter)
        return (
          <Sprite
            key={id}
            x={0}
            y={0}
            width={width}
            height={height}
            texture={fill.texture || Texture.EMPTY}
            eventMode="static"
            zIndex={STRATAS.BACKGROUND}
            filters={filters}
          />
        )
      })}
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

          // console.log('Add circles')

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
            setCircles([...circles, ..._c])
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

          setCircles((c) => [...c, ...newCircles])
        }}
        pointerup={async () => {
          // Complete our interpolation, save any outstanding circles to textures, then push
          // textures to undo stack.
          await saveTexture()
          const currTex = renderUndoTextures({
            app,
            width,
            height,
            fills: mapState.background.fills
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
    private prevTex: Record<string, Partial<FillTexture>>,
    private currTex: Record<string, Partial<FillTexture>>,
    private setCurrTex: (tex: Record<string, Partial<FillTexture>>) => void
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
  fills: Record<string, Partial<FillTexture>>
  width: number
  height: number
  app: Application
}
function renderUndoTextures({
  fills,
  width,
  height,
  app
}: RenderUndoTexturesArgs): Record<string, Partial<FillTexture>> {
  const texMap = {}
  for (const [id, { texture }] of Object.entries(fills)) {
    const renderTexture = RenderTexture.create({
      width,
      height,
      multisample: MSAA_QUALITY.HIGH,
      resolution: window.devicePixelRatio
    })

    app.renderer.render(new PixiSprite(texture), {
      renderTexture,
      blit: true
    })

    texMap[id] = { texture: renderTexture }
  }

  return texMap
}
