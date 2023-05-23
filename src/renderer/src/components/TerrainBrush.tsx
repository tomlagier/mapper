import { Container, Sprite, useApp } from '@pixi/react'
import { useEffect, useRef, useState } from 'react'
import { getSplatterCircles } from '@renderer/utils/circles'
import {
  Texture,
  Filter,
  RenderTexture,
  MSAA_QUALITY,
  Graphics,
  BlurFilter,
  Sprite as PixiSprite,
  Application
} from 'pixi.js'
import { useCircle } from '@renderer/hooks/useCircle'
import { UndoCommand } from '@renderer/utils/undo'
import { FillTexture, MapState } from '@renderer/types/state'
import { STRATAS } from '@renderer/types/stratas'
import { Point, getNormalizedMagnitude, interpolate } from '@renderer/utils/interpolate'

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
  setFillTextures: (textures: Record<string, Partial<FillTexture>>) => void
}

export function TerrainBrush({
  width,
  height,
  setCursor,
  pushUndo,
  mapState,
  activeFill,
  setFillTextures
}: TerrainBrushProps) {
  // Eventually these will be controlled by the UI layer
  const size = 25
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

  // Initialize the renderTextures and filters used for each loaded fill.
  useEffect(() => {
    if (!app) return

    let firstTexture
    const fillTextures: Record<string, Partial<FillTexture>> = {}
    for (const [id, fill] of Object.entries(mapState.background.fills)) {
      const renderTexture = RenderTexture.create({
        width,
        height,
        multisample: MSAA_QUALITY.HIGH,
        resolution: window.devicePixelRatio
      })

      // TODO: Pull the first texture & only do the paint if it's a new canvas
      if (id === 'grass') {
        firstTexture = renderTexture
      }

      const filter = new Filter(undefined, fragShader, {
        sample: Texture.from(fill.path)
      })
      filter.resolution = 2
      fillTextures[id] = { filter, texture: renderTexture }
    }

    // There must be a better way to do this but I can't figure it out. Fill the default
    // texture with white so that we can use it as a mask.
    const g = new Graphics().beginFill(0xffffff).drawRect(0, 0, width, height).endFill()
    app.renderer.render(g, { renderTexture: firstTexture, blit: true })

    setFillTextures(fillTextures)
  }, [app])

  // Update our render texture with the batch of circles drawn since the last save.
  const saveTexture = async () => {
    if (circles.length === 0) return

    // We fill the active texture's layer with white circles, and all the other layers
    // with black so we're adding the paint to the correct layer and subtracting it from the
    // rest, allowing us to be layer order agnostic.
    for (const [id, fill] of Object.entries(mapState.background.fills)) {
      const isActive = id === activeFill
      const container = isActive ? containerRef.current : inverseContainerRef.current
      app.renderer.render(container!, {
        renderTexture: fill.texture,
        blit: true,
        clear: false
      })
    }

    setCircles(() => [])
  }

  // Periodically save out the circles to texture while dragging.
  const limit = 25
  useEffect(() => {
    if (circles.length < limit) return
    saveTexture()
  }, [circles])

  // Refs for the container we use to render out the circles
  const containerRef = useRef(null)
  const inverseContainerRef = useRef(null)

  // Because the sample pointermove sample rate is kinda low, we use interpolation to render
  // circles between ticks of pointermove. This tracks that state.
  const [lastCircleSpot, setLastCircleSpot] = useState<Point>()
  const paintInterval = 5
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
              size
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
          // TODO: This probably should work when we drag from offscreen as well b/c currently
          // that breaks the undo stack.

          // Push the current terrain textures to the undo stack
          setPrevTex()

          const newCircles = getSplatterCircles({
            x: e.global.x,
            y: e.global.y,
            splatterRadius,
            splatterAmount,
            size
          })

          setCircles((c) => [...c, ...newCircles])
          setLastCircleSpot(() => ({ ...e.global }))

          await saveTexture()
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
          pushUndo(new TerrainUndoCommand(prevTex, currTex, setFillTextures))
        }}
        zIndex={-9999}
      />
      {/**
       * Container that contains our inverse circles, i.e. the black circles we paint
       * on all non-active texture layers */}
      <Container
        ref={inverseContainerRef}
        // TODO: Allow parameterization of the blur
        // Because this is getting applied to the circles, it will get "baked in" to the render
        // texture & can't be dynamically updated for past painted things. If we want to sharpen
        // existing edges, we need to play with the alpha cutoffs that we render stuff at.
        filters={[new BlurFilter()]}
      >
        {mounted &&
          circles.map(([x, y, size], i) => (
            <Sprite
              x={x}
              y={y}
              scale={size / 10}
              key={i}
              tint="black"
              alpha={0.3}
              texture={circleTexture}
              zIndex={STRATAS.TOOLS}
            />
          ))}
      </Container>
      {/** Container that contains the circles to paint on the active layer */}
      <Container ref={containerRef} filters={[new BlurFilter()]}>
        {mounted &&
          circles.map(([x, y, size], i) => (
            <Sprite
              x={x}
              y={y}
              scale={size / 10}
              key={i}
              tint="white"
              alpha={0.3}
              texture={circleTexture}
              zIndex={STRATAS.TOOLS}
            />
          ))}
      </Container>

      {Object.entries(mapState.background.fills).map(([id, fill], idx) => {
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
            filters={filters}
          />
        )
      })}
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
  fills: Record<string, FillTexture>
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

const fragShader = `
precision mediump float;

varying vec2 vTextureCoord;
varying vec4 vColor;

uniform sampler2D uSampler;
uniform sampler2D sample;

void main(void)
{
  vec4 sourcePixel = texture2D(uSampler, vTextureCoord);

  // Ignore full transparent pixels
  if(sourcePixel.a == 0.0) discard;

  // TODO: Support arbitrary image size
  vec2 sampleCoords = fract(vTextureCoord * 8.0);
  vec4 samplePixel = texture2D(sample, sampleCoords);

  vec4 result = vec4(samplePixel.rgb * sourcePixel.r * sourcePixel.a, sourcePixel.r * sourcePixel.a);

  gl_FragColor = result;
}
`
