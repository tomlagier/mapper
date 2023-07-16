import {
  DEFAULT_LAYER_ID,
  DEFAULT_TERRAIN_BRUSHES,
  Layer,
  MapState,
  TerrainBrush,
  UiState
} from '@renderer/types/state'
import { Tool, Tools } from '@renderer/utils/tools'
import { useCallback, useState } from 'react'
import { cloneDeep } from 'lodash'

export type SetUiState = (cb: (state: UiState) => UiState) => void
export type SetMapState = (cb: (state: MapState) => MapState) => void
export type SetTerrainBrushes = (terrainBrushes: Record<string, TerrainBrush>) => void
export type UpdateTerrainBrushes = (terrainBrushes: Record<string, Partial<TerrainBrush>>) => void
export type SetLayers = (layers: Record<string, Layer>) => void
export type UpdateLayers = (layers: Record<string, Partial<Layer>>) => void
export type UpdateLayerOrder = (layerOrder: string[]) => void
export type SetActiveTool = (tool: Tool) => void

const defaultMapState: MapState = {
  terrainBrushes: DEFAULT_TERRAIN_BRUSHES,
  layers: {},
  layerOrder: [],
  width: 512,
  height: 512
}

export function getDefaultMapState(): MapState {
  return cloneDeep(defaultMapState)
}

export function useAppState() {
  const [uiState, setUiState] = useState<UiState>({
    activeTool: Tools.TERRAIN,
    activeLayer: DEFAULT_LAYER_ID,
    filePath: null,
    loaded: false
  })

  const [mapState, setMapState] = useState<MapState>(getDefaultMapState())

  // Reducers
  // Set new terrain brushes
  const setTerrainBrushes = useCallback(
    (terrainBrushes: Record<string, TerrainBrush>) => {
      setMapState((s) => ({
        ...s,
        terrainBrushes
      }))
    },
    [setMapState]
  )

  // Update terrain brushes by ID
  const updateTerrainBrushes = useCallback(
    (terrainBrushes: Record<string, Partial<TerrainBrush>>) => {
      setMapState((s) => {
        const mergedBrushes = mergeMapsById(s.terrainBrushes, terrainBrushes)
        return {
          ...s,
          terrainBrushes: mergedBrushes
        }
      })
    },
    [setMapState]
  )

  // Set new layers
  const setLayers = useCallback(
    (layers: Record<string, Layer>) => {
      setMapState((s) => ({
        ...s,
        layers
      }))
    },
    [setMapState]
  )

  // Update layers by ID
  const updateLayers = useCallback(
    (layers: Record<string, Partial<Layer>>, layerOrder?: string[]) => {
      setMapState((s) => {
        const mergedLayers = mergeMapsById(s.layers, layers)

        return {
          ...s,
          layers: mergedLayers,
          layerOrder: layerOrder || s.layerOrder
        }
      })
    },
    [setMapState]
  )

  // Update layer order
  const updateLayerOrder = useCallback(
    (layerOrder: string[]) => {
      setMapState((s) => ({
        ...s,
        layerOrder
      }))
    },
    [setMapState]
  )

  // Set the active tool
  const setActiveTool = useCallback(
    (activeTool: Tool) => {
      setUiState((s) => ({ ...s, activeTool }))
    },
    [setUiState]
  )

  return {
    uiState,
    setUiState,
    mapState,
    setMapState,
    setTerrainBrushes,
    updateTerrainBrushes,
    setLayers,
    updateLayers,
    updateLayerOrder,
    setActiveTool
  }
}

// Merge fills together with existing map state
export function mergeMapsById<T>(
  existingObjects: Record<string, T>,
  newObjects: Record<string, Partial<T>>
): Record<string, T> {
  // Merge our textures with the existing fills
  const copy = { ...existingObjects }

  for (const id of Object.keys(existingObjects)) {
    copy[id] = {
      ...existingObjects[id],
      ...newObjects[id]
    }
  }

  for (const id of Object.keys(newObjects)) {
    if (!copy[id]) {
      copy[id] = newObjects[id] as T
    }
  }

  return copy
}
