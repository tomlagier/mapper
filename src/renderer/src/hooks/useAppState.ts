import { FillTexture, MapState, UiState } from '@renderer/types/state'
import { DEFAULT_FILLS } from '@renderer/utils/fills'
import { TOOL, TOOLS } from '@renderer/utils/tools'
import { useCallback, useState } from 'react'
import { cloneDeep } from 'lodash'

export type SetUiState = (cb: (state: UiState) => UiState) => void
export type SetMapState = (cb: (state: MapState) => MapState) => void
export type SetFillTextures = (textures: Record<string, Partial<FillTexture>>) => void
export type SetActiveTool = (tool: TOOL) => void

const defaultMapState = {
  background: {
    fills: DEFAULT_FILLS
  },
  width: 512,
  height: 512
}

export function getDefaultMapState() {
  return cloneDeep(defaultMapState)
}

export function useAppState() {
  const [uiState, setUiState] = useState<UiState>({
    activeTool: TOOLS.TERRAIN,
    activeFill: Object.keys(DEFAULT_FILLS)[0],
    filePath: null,
    loaded: false
  })

  const [mapState, setMapState] = useState<MapState>(getDefaultMapState())

  const setFillTextures = useCallback(
    (fillMap: Record<string, Partial<FillTexture>>) => {
      setMapState((s) => mergeFills(s, fillMap))
    },
    [setMapState]
  )

  const setActiveTool = useCallback(
    (activeTool: TOOL) => {
      setUiState((s) => ({ ...s, activeTool }))
    },
    [setUiState]
  )

  return {
    uiState,
    setUiState,
    mapState,
    setMapState,
    setFillTextures,
    setActiveTool
  }
}

// Merge fills together with existing map state
export function mergeFills(mapState, newFills) {
  // Merge our textures with the existing fills
  const fills = { ...mapState.background.fills }
  for (const id of Object.keys(fills)) {
    fills[id] = {
      ...fills[id],
      ...newFills[id]
    }
  }

  return {
    ...mapState,
    background: {
      ...mapState.background,
      fills
    }
  }
}
