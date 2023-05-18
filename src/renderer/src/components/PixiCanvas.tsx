import { Sprite, Stage } from '@pixi/react'
import { TOOLS, TOOL } from '../utils/tools'
import { TerrainBrush } from './TerrainBrush'
import { useUndo } from '@renderer/utils/undo'
import { useEffect, useState } from 'react'
import { MapState, UiState } from '@renderer/types/state'
import { Texture } from 'pixi.js'
import { STRATAS } from '@renderer/types/stratas'

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
  setMapState: (mapState: MapState) => void
}

export function PixiCanvas({ uiState, mapState, setMapState }: PixiCanvasProps) {
  const width = 512
  const height = 512

  // TODO: Handle viewport
  const [cursor, setCursor] = useState('default')
  const { push } = useUndo()

  return (
    <div style={{ cursor, width: '100%', height: '100%' }}>
      <Stage width={width} height={height} options={{ antialias: true, resolution: 2 }}>
        {/** Background strata */}
        {/* <Sprite
          texture={mapState.background.texture || Texture.EMPTY}
          zIndex={STRATAS.BACKGROUND}
        /> */}

        {/** Object strata */}

        {/** Tool strata */}
        {uiState.activeTool === TOOLS.TERRAIN_BRUSH && (
          <TerrainBrush
            width={width}
            height={height}
            setCursor={setCursor}
            pushUndo={push}
            mapState={mapState}
            setMapState={setMapState}
            activeFill={uiState.activeFill}
          />
        )}

        {/** UI strata */}
      </Stage>
    </div>
  )
}
