import { Sprite, useApp } from '@pixi/react'
import { useEffect, useRef, useState } from 'react'
import { getSplatterCircles } from '@renderer/utils/circles'
import { Texture, Rectangle } from 'pixi.js'
import { useCircle } from '@renderer/hooks/useCircle'
import { UndoCommand } from '@renderer/utils/undo'

interface TerrainBrushProps {
  width: number
  height: number
  // Eventually we'll use this to control the cursor size
  setCursor: (cursor: string) => void

  // Push command onto the undo stack
  pushUndo: (command: UndoCommand) => void
}
export function TerrainBrush({ width, height, setCursor, pushUndo }: TerrainBrushProps) {
  const textures = ['red']
  const size = 10
  const splatterRadius = 100
  const splatterAmount = 10
  const [circles, setCircles] = useState<Array<Array<number>>>([])
  const [mounted, setMounted] = useState(false)

  // Texture to render a single circle
  const circleTexture = useCircle()

  // Combined texture that gets saved out when we collapse textures
  // Eventually needs to go onto undo stack so we can restore it
  const [prevTex, setPrevTex] = useState<Texture>()
  const [currTex, setCurrTex] = useState<Texture>()
  const app = useApp()

  const limit = 100

  useEffect(() => {
    setMounted(true)
  }, [])

  // Saves the combined circles out to a texture for performance
  const saveTexture = () => {
    const tex = app.renderer.generateTexture(app.stage, {
      region: new Rectangle(0, 0, width, height),
      resolution: 2
    })
    setCurrTex(tex)

    setCircles([])

    return tex
  }

  // Periodically save out the texture while dragging.
  useEffect(() => {
    if (circles.length < limit) return
    saveTexture()
  }, [circles])

  return (
    <>
      <Sprite
        eventMode="static"
        x={0}
        y={0}
        width={width}
        height={height}
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
          setPrevTex(tex)
        }}
        pointerup={() => {
          const tex = saveTexture()
          pushUndo(new TerrainUndoCommand(prevTex, tex, setCurrTex))
        }}
        texture={currTex || Texture.EMPTY}
        zIndex={-1}
      />
      {mounted &&
        circles.map(([x, y, size], i) => (
          <Sprite x={x} y={y} scale={size / 10} key={i} tint="green" texture={circleTexture} />
        ))}
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
