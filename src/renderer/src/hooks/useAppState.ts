import { FillTexture, MapState, UiState } from '@renderer/types/state'
import { DEFAULT_FILLS } from '@renderer/utils/fills'
import { TOOLS } from '@renderer/utils/tools'
import { useCallback, useState } from 'react'

export type SetUiState = (cb: (state: UiState) => UiState) => void
export type SetMapState = (cb: (state: MapState) => MapState) => void

export function useAppState() {
  const [uiState, setUiState] = useState<UiState>({
    activeTool: TOOLS.TERRAIN_BRUSH,
    activeFill: Object.keys(DEFAULT_FILLS)[0],
    filePath: null
  })

  const [mapState, setMapState] = useState<MapState>({
    background: {
      fills: DEFAULT_FILLS
    },
    // objects: null,
    width: 512,
    height: 512
  })

  const setFillTextures = useCallback(
    (fillMap: Record<string, Partial<FillTexture>>) => {
      setMapState((s) => {
        // Merge our textures with the existing fills
        const fills = { ...s.background.fills }
        for (const id of Object.keys(fills)) {
          fills[id] = {
            ...fills[id],
            ...fillMap[id]
          }
        }

        return {
          ...s,
          background: {
            ...s.background,
            fills
          }
        }
      })
    },
    [setMapState]
  )

  return {
    uiState,
    setUiState,
    mapState,
    setMapState,
    setFillTextures
  }
}
