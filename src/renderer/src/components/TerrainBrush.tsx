import { Container, Sprite, useApp } from '@pixi/react'
import { useEffect, useRef, useState } from 'react'
import { getSplatterCircles } from '@renderer/utils/circles'
import { Texture, Rectangle, Filter, RenderTexture, MSAA_QUALITY, Graphics } from 'pixi.js'
import { useCircle } from '@renderer/hooks/useCircle'
import { UndoCommand } from '@renderer/utils/undo'
import { MapState } from '@renderer/types/state'
import { STRATAS } from '@renderer/types/stratas'
import blue from '@resources/backgroundTextures/grass1.png'
import red from '@resources/backgroundTextures/stones.png'

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
  const size = 10
  const splatterRadius = 1
  const splatterAmount = 1
  const [circles, setCircles] = useState<Array<Array<number>>>([])

  // Our render texture isn't created until the component is mounted, so we don't render our unsaved
  // circles until then.
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Texture to render a single circle
  const circleTexture = useCircle()

  // Combined texture that gets saved out when we collapse textures
  const [prevTex, setPrevTex] = useState<Texture>()
  const [t2, setT2] = useState<Texture>()

  // Current fill that we're painting
  const fill = mapState.background.fills[activeFill]

  const setCurrTex = (tex: Texture) => {
    // We need to do a few things:
    // - Update the fillMap texture
    // - Update the final texture
    setMapState({ ...mapState, background: { ...mapState.background, texture: tex } })
  }

  const app = useApp()

  useEffect(() => {
    if (!app) return

    const renderTexture = RenderTexture.create({
      width,
      height,
      multisample: MSAA_QUALITY.HIGH,
      resolution: window.devicePixelRatio
    })

    // There must be a better way to do this but I can't figure it out
    const g = new Graphics().beginFill(0xffffff).drawRect(0, 0, width, height).endFill()

    app.renderer.render(g, { renderTexture, blit: true })

    const r2 = RenderTexture.create({
      width,
      height,
      multisample: MSAA_QUALITY.HIGH,
      resolution: window.devicePixelRatio
    })

    r2.baseTexture.clearColor = [0, 0, 0, 255]

    setPrevTex(renderTexture)
    setT2(r2)
  }, [app])

  // Saves the combined circles out to a texture for performance
  const saveTexture = async () => {
    if (circles.length === 0) return

    // Render white into prevTex
    app.renderer.render(containerRef.current, {
      region: new Rectangle(0, 0, width, height),
      resolution: 2,
      renderTexture: activeFill === 0 ? prevTex : t2,
      blit: true,
      clear: false
    })

    // Render black into t2
    app.renderer.render(inverseContainerRef.current, {
      region: new Rectangle(0, 0, width, height),
      resolution: 2,
      renderTexture: activeFill === 0 ? t2 : prevTex,
      blit: true,
      clear: false
    })

    // Add pixels to current fill texture
    // const currentFillPixels = fill.pixels || new Uint8Array(circlePixels.length).fill(0)

    // for (let i = 0; i < circlePixels.length; i++) {
    //   const isAlpha = i % 4 === 3
    //   if (isAlpha) currentFillPixels[i] += Math.min(circlePixels[i], 255)
    //   else currentFillPixels[i] = circlePixels[i]
    // }

    // // Create new texture from pixels
    // const fillTex = Texture.fromBuffer(circlePixels, width, height, {
    //   resolution: 2
    // })

    // setPrevTex(fillTex)

    // Assign to fill texture
    // setMapState({
    //   ...mapState,
    //   background: {
    //     ...mapState.background,
    //     fills: [
    //       ...mapState.background.fills.slice(0, activeFill),
    //       { ...fill, pixels: currentFillPixels, texture: fillTex },
    //       ...mapState.background.fills.slice(activeFill + 1)
    //     ]
    //   }
    // })

    setCircles([])
  }

  // Load our fill textures

  // Periodically save out the texture while dragging.
  // Currently causes flickering, but could be implemented as a performance improvement in the future
  const limit = 50
  useEffect(() => {
    if (circles.length < limit) return
    saveTexture()
  }, [circles])

  const blueRef = useRef(null)
  const redRef = useRef(null)
  const containerRef = useRef(null)
  const inverseContainerRef = useRef(null)

  // A full screen sprite for each fill we're drawing on

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
          if (e.buttons !== 1) return

          // Mouse is down, add our circles
          const newCircles = getSplatterCircles({
            x: e.global.x,
            y: e.global.y,
            splatterRadius,
            splatterAmount,
            size
          })

          setCircles([...circles, ...newCircles])
        }}
        pointerdown={() => {
          const tex = saveTexture()
          // setPrevTex(tex)
        }}
        pointerup={() => {
          const tex = saveTexture()
          // pushUndo(new TerrainUndoCommand(prevTex, tex, setCurrTex))
        }}
        zIndex={-9999}
      />
      <Container ref={inverseContainerRef}>
        {mounted &&
          circles.map(([x, y, size], i) => (
            <Sprite
              x={x}
              y={y}
              scale={size / 10}
              key={i}
              tint="black"
              alpha={0.5}
              texture={circleTexture}
              zIndex={STRATAS.TOOLS}
            />
          ))}
      </Container>
      <Container ref={containerRef}>
        {mounted &&
          circles.map(([x, y, size], i) => (
            <Sprite
              x={x}
              y={y}
              scale={size / 10}
              key={i}
              tint="white"
              alpha={0.5}
              texture={circleTexture}
              zIndex={STRATAS.TOOLS}
            />
          ))}
      </Container>

      {/* <Sprite
        texture={mapState.background.texture || Texture.EMPTY}
        zIndex={STRATAS.OBJECTS}
        width={width}
        height={height}
        x={0}
        y={0}
        filters={[testFilter]}
      /> */}

      <Sprite
        ref={redRef}
        x={0}
        y={0}
        width={width}
        height={height}
        texture={prevTex || Texture.EMPTY}
        zIndex={999}
        // tint="white"
        filters={[redFilter]}
        // filterArea={new Rectangle(0, 0, width, height)}
      />
      <Sprite
        ref={blueRef}
        x={0}
        y={0}
        width={width}
        height={height}
        texture={t2 || Texture.EMPTY}
        zIndex={-2}
        filters={[blueFilter]}
        // filterArea={new Rectangle(0, 0, width, height)}
      />
    </>
  )
}

class TerrainUndoCommand implements UndoCommand {
  constructor(
    private prevTex: Texture | undefined,
    private currTex: Texture | undefined,
    private setCurrTex: (tex: Texture) => void
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

const blueFilter = new Filter(undefined, fragShader, {
  sample: Texture.from(blue)
}) // both default
blueFilter.resolution = 2

const redFilter = new Filter(undefined, fragShader, {
  sample: Texture.from(red)
}) // both default
redFilter.resolution = 2
