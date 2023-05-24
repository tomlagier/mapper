import { Sprite, Stage } from '@pixi/react'
import { TOOLS, TOOL } from '../utils/tools'
import { TerrainBrush } from './TerrainBrush'
import { useUndo } from '@renderer/utils/undo'
import { useEffect, useRef, useState } from 'react'
import { FillTexture, MapState, UiState } from '@renderer/types/state'
import { Texture } from 'pixi.js'
import { STRATAS } from '@renderer/types/stratas'
import { PixiViewport } from './Viewport'

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
  const width = 512
  const height = 512

  // TODO: Handle viewport
  const [cursor, setCursor] = useState('default')
  const { push } = useUndo()
  // get the actual viewport instance
  const viewportRef = useRef()

  return (
    <div style={{ cursor, width: '100%', height: '100%' }}>
      <Stage width={width} height={height} options={{ antialias: true, resolution: 2 }}>
        {/** Background strata */}
        <PixiViewport
          ref={viewportRef}
          screenWidth={width}
          screenHeight={height}
          worldWidth={width}
          worldHeight={height}
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
              width={width}
              height={height}
              setCursor={setCursor}
              pushUndo={push}
              mapState={mapState}
              setFillTextures={setFillTextures}
              activeFill={uiState.activeFill}
            />
          )}

          {/** Object strata */}

          {/** Tool strata */}

          {/** UI strata */}
        </PixiViewport>
      </Stage>
    </div>
  )
}
