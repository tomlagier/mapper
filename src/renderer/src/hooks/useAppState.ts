import { FillTexture, MapState, UiState } from '@renderer/types/state'
import { DEFAULT_FILLS } from '@renderer/utils/fills'
import { TOOLS } from '@renderer/utils/tools'
import { Filter, RenderTexture } from 'pixi.js'
import { useCallback, useState } from 'react'

export function useAppState() {
  const [uiState, setUiState] = useState<UiState>({
    activeTool: TOOLS.TERRAIN_BRUSH,
    activeFill: Object.keys(DEFAULT_FILLS)[0]
  })

  const [mapState, setMapState] = useState<MapState>({
    background: {
      fills: DEFAULT_FILLS
    },
    objects: null
  })

  const setFillTextures = useCallback(
    (fillMap: Record<string, Partial<FillTexture>>) => {
      setMapState((s) => {
        // Merge our textures with the existing fills
        const fills = { ...s.background.fills }
        for (const [id, val] of Object.entries(fillMap)) {
          fills[id] = {
            ...fills[id],
            ...val
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
