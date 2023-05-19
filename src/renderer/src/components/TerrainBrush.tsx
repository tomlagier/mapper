import { Container, Sprite, useApp } from '@pixi/react'
import { useEffect, useRef, useState } from 'react'
import { getSplatterCircles } from '@renderer/utils/circles'
import {
  Texture,
  Rectangle,
  Filter,
  RenderTexture,
  MSAA_QUALITY,
  Graphics,
  Point,
  BlurFilter,
  Sprite as PixiSprite
} from 'pixi.js'
import { useCircle } from '@renderer/hooks/useCircle'
import { UndoCommand } from '@renderer/utils/undo'
import { MapState } from '@renderer/types/state'
import { STRATAS } from '@renderer/types/stratas'
import blue from '@resources/backgroundTextures/grass1.png'
import red from '@resources/backgroundTextures/stones.png'
import { DEFAULT_FILLS } from '@renderer/utils/fills'

interface TerrainBrushProps {
  width: number
  height: number
  // Eventually we'll use this to control the cursor size
  setCursor: (cursor: string) => void

  // Push command onto the undo stack
  pushUndo: (command: UndoCommand) => void

  // Map state
  mapState: MapState
  setMapState: (mapState: MapState) => void

  activeFill: number
}

export function TerrainBrush({
  width,
  height,
  setCursor,
  pushUndo,
  mapState,
  setMapState,
  activeFill
}: TerrainBrushProps) {
  const size = 25
  const splatterRadius = 100
  const splatterAmount = 15
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
  const [prevTex, _setPrevTex] = useState<Record<string, Texture>>({})

  const setCurrTex = (tex: Record<string, Texture>) => {
    // TODO: oof
    setMapState((s) => {
      // Merge our textures with the existing fills
      const fills = { ...s.background.fills }
      for (const [id, texture] of Object.entries(tex)) {
        fills[id].texture = texture
      }

      return {
        ...s,
        background: {
          ...s.background,
          fills
        }
      }
    })
  }

  const setPrevTex = () => {
    _setPrevTex((s) => {
      const prev = {}
      for (const [id, { texture }] of Object.entries(mapState.background.fills)) {
        const renderTexture = RenderTexture.create({
          width,
          height,
          multisample: MSAA_QUALITY.HIGH,
          resolution: window.devicePixelRatio
        })

        app.renderer.render(new PixiSprite(texture), {
          renderTexture,
          region: new Rectangle(0, 0, width, height),
          resolution: 2,
          blit: true
        })

        prev[id] = renderTexture
      }

      console.log('down end')
      return prev
    })
  }

  // Initialize the renderTextures used for each loaded fill
  // TODO: Initialize from saved state, and allow for new fills to be added
  useEffect(() => {
    if (!app) return

    let firstTexture
    const tex: Record<string, Texture> = {}
    for (const id of Object.keys(mapState.background.fills)) {
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

      tex[id] = renderTexture
    }

    // There must be a better way to do this but I can't figure it out. Fill the default
    // texture with white so that we can use it as a mask.
    const g = new Graphics().beginFill(0xffffff).drawRect(0, 0, width, height).endFill()
    app.renderer.render(g, { renderTexture: firstTexture, blit: true })

    setCurrTex(tex)
  }, [app])

  // Update our render texture with the batch of circles drawn since the last save.
  const saveTexture = async () => {
    if (circles.length === 0) return

    for (const [id, fill] of Object.entries(mapState.background.fills)) {
      const isActive = id === activeFill
      const container = isActive ? containerRef.current : inverseContainerRef.current
      app.renderer.render(container, {
        region: new Rectangle(0, 0, width, height),
        resolution: 2,
        renderTexture: fill.texture,
        blit: true,
        clear: false
      })
    }

    setCircles(() => [])
  }

  // Periodically save out the texture while dragging.
  const limit = 25
  useEffect(() => {
    if (circles.length < limit) return
    saveTexture()
  }, [circles])

  const containerRef = useRef(null)
  const inverseContainerRef = useRef(null)

  const [lastCircleSpot, setLastCircleSpot] = useState(null)
  const paintInterval = 5
  return (
    <>
      <Sprite
        eventMode="static"
        x={0}
        y={0}
        width={width}
        height={height}
        texture={Texture.EMPTY}
        pointermove={(e) => {
          // TODO: Clean this up
          if (e.buttons !== 1) return

          let lastX = lastCircleSpot.x
          let lastY = lastCircleSpot.y
          let distance = Math.sqrt(
            Math.pow(e.global.x - lastCircleSpot.x, 2) + Math.pow(e.global.y - lastCircleSpot.y, 2)
          )

          const _c = []
          while (distance && distance > paintInterval) {
            distance -= paintInterval
            // Get X and Y coordinates along the line
            const v = new Point(e.global.x - lastCircleSpot.x, e.global.y - lastCircleSpot.y)
            const magnitude = Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2))
            const normalized = new Point(v.x / magnitude, v.y / magnitude)
            const x = lastX + normalized.x * paintInterval
            const y = lastY + normalized.y * paintInterval

            const newCircles = getSplatterCircles({
              x,
              y,
              splatterRadius,
              splatterAmount,
              size
            })

            _c.push(...newCircles)
            lastX = x
            lastY = y
          }

          if (_c.length) {
            setCircles([...circles, ..._c])
          }

          if (lastY !== lastCircleSpot.y || lastX !== lastCircleSpot.x) {
            setLastCircleSpot({ x: lastX, y: lastY })
          }
        }}
        pointerdown={async (e) => {
          // Save out our previous texture state
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
          console.log('up start')
          await saveTexture()
          const currTex = {}
          for (const [id, { texture }] of Object.entries(mapState.background.fills)) {
            const renderTexture = RenderTexture.create({
              width,
              height,
              multisample: MSAA_QUALITY.HIGH,
              resolution: window.devicePixelRatio
            })

            app.renderer.render(new PixiSprite(texture), {
              renderTexture,
              region: new Rectangle(0, 0, width, height),
              resolution: 2,
              blit: true
            })

            currTex[id] = renderTexture
          }
          pushUndo(new TerrainUndoCommand(prevTex, currTex, setCurrTex))
          console.log('up end')
        }}
        zIndex={-9999}
      />
      <Container ref={inverseContainerRef} filters={[new BlurFilter()]}>
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
        // TODO: Cache this
        const filter = new Filter(undefined, fragShader, {
          sample: Texture.from(fill.path)
        }) // both default
        filter.resolution = 2

        return (
          <Sprite
            key={id}
            x={0}
            y={0}
            width={width}
            height={height}
            texture={fill.texture || Texture.EMPTY}
            filters={[filter]}
          />
        )
      })}
    </>
  )
}

class TerrainUndoCommand implements UndoCommand {
  constructor(
    private prevTex: Record<string, Texture>,
    private currTex: Record<string, Texture>,
    private setCurrTex: (tex: Record<string, Texture>) => void
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

  vec2 sampleCoords = fract(vTextureCoord * 8.0);
  vec4 samplePixel = texture2D(sample, sampleCoords);

  vec4 result = vec4(samplePixel.rgb * sourcePixel.r * sourcePixel.a, sourcePixel.r * sourcePixel.a);

  gl_FragColor = result;
}
`
