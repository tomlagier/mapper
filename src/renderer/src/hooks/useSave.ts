import { MapState, UiState } from '@renderer/types/state'
import { useEffect, useState } from 'react'
import { SetMapState, SetUiState, getDefaultMapState } from './useAppState'
import { Application } from 'pixi.js'
import { useHotkeys } from 'react-hotkeys-hook'
import { getModKey } from '@renderer/utils/modkey'
import {
  createLayers,
  createTerrainBrushes,
  deserializeMapState,
  serializeMapState
} from '@renderer/utils/serialize'

interface UseSaveArgs {
  setUiState: SetUiState
  setMapState: SetMapState
  mapState: MapState
  uiState: UiState
  app?: Application
  clearUndoStack: VoidFunction
}
export function useSave({
  setUiState,
  setMapState,
  mapState,
  uiState,
  app,
  clearUndoStack
}: UseSaveArgs) {
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  // Bind handlers to save
  useEffect(() => {
    window.api.onSaveLocationSet((_, path) => {
      setUiState((s) => ({
        ...s,
        filePath: path
      }))
    })

    window.api.onSaveComplete(() => setSaving(false))

    window.api.onLoad(async (_, file) => {
      const mapState = await loadMap(file, app!)
      clearUndoStack()
      setMapState(() => mapState)
      setUiState((s) => ({ ...s, activeLayer: mapState.layerOrder[0], loaded: true }))
    })

    window.api.onNewDoc(async (_, path) => {
      if (!path) return

      // Create new doc & load it into mapState
      // TODO: Allow configuration of map size
      const newMapState = await createNewMapState(app)
      clearUndoStack()
      setMapState((s) => newMapState)
      setUiState((s) => ({
        ...s,
        activeLayer: newMapState.layerOrder[0],
        filePath: path,
        loaded: true
      }))

      await save(newMapState, path)
    })

    return () => {
      window.api.clearSaveHandlers()
    }
  }, [app])

  // Return save functions
  async function save(overrideMapState?: MapState, overridePath?: string) {
    if (!uiState.loaded) return

    const _mapState = overrideMapState || mapState
    const _path = overridePath || uiState.filePath

    if (!_path) return saveAs(_mapState)

    setSaving(true)
    const serializedState = await serializeMapState(app!.renderer.extract, _mapState)
    window.api.save(serializedState, _path)
    setSaving(false)
  }

  async function saveAs(overrideMapState?: MapState) {
    if (!uiState.loaded) return

    const _mapState = overrideMapState || mapState

    setSaving(true)
    const serializedState = await serializeMapState(app!.renderer.extract, _mapState)
    window.api.saveAs(serializedState)
    setSaving(false)
  }

  async function load() {
    setLoading(true)
    window.api.load()
  }

  async function newDoc() {
    // If we've got a loaded doc, save it first
    if (uiState.loaded) {
      await save()
    }

    // Create a new document
    window.api.newDoc()
  }

  useHotkeys(`${getModKey()}+s`, () => save(), [app, mapState, uiState])
  useHotkeys(`${getModKey()}+shift+s`, () => saveAs(), [app, mapState, uiState])
  useHotkeys(`${getModKey()}+o`, () => load(), [app, mapState, uiState])
  useHotkeys(`${getModKey()}+n`, () => newDoc(), [app, mapState, uiState])

  return { save, saveAs, load, saving, loading, newDoc }
}

async function loadMap(file, app): Promise<MapState> {
  const loadedMapState = await deserializeMapState(file, app)
  return loadedMapState
}

async function createNewMapState(app): Promise<MapState> {
  const newMapState = getDefaultMapState()
  const brushes = createTerrainBrushes({ mapState: newMapState })
  const layers = await createLayers({ mapState: newMapState, app, backgroundId: 'grass' })

  newMapState.terrainBrushes = brushes
  newMapState.layers = layers
  newMapState.layerOrder = Object.values(layers).map((layer) => layer.id)

  return newMapState
}
