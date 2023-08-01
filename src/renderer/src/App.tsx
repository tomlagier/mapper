import { PixiCanvas } from './components/PixiCanvas'
import { MantineProvider, Divider, Navbar, Box } from '@mantine/core'
import { useAppState } from './hooks/useAppState'
import { AppSkeleton } from './components/AppSkeleton'
import { HeaderMenu } from './components/HeaderMenu'
import { useUndo } from '@renderer/utils/undo'
import { useSave } from './hooks/useSave'
import { Application } from 'pixi.js'
import { useState } from 'react'
import { SavePreviews } from './components/SavePreviews'
import { RENDER_TERRAIN_DEBUG } from './config'
import { ToolSelector } from './components/ToolSelector'
import { ToolProperties } from './components/ToolProperties'
import { LayersPanel } from './components/LayersPanel'
import { Modals } from './components/modals/Modals'

function App(): JSX.Element {
  // State
  const {
    mapState,
    uiState,
    userPreferences,
    setUiState,
    setMapState,
    setUserPreferences,
    setActiveTool,
    updateLayers
  } = useAppState()

  // Pixi app
  const [app, setApp] = useState<Application>()

  const { push, undo, redo, clear } = useUndo()
  const { save, saveAs, load, newDoc, saveUserPreferences, loadUserPreferences } = useSave({
    setUiState,
    setMapState,
    setUserPreferences,
    mapState,
    uiState,
    app,
    clearUndoStack: clear
  })

  return (
    <MantineProvider>
      <AppSkeleton
        sidebar={
          <Navbar width={{ base: 300 }} p="md">
            {uiState.loaded && (
              <ToolSelector activeTool={uiState.activeTool} setActiveTool={setActiveTool} />
            )}
            <Divider />
            {uiState.loaded && (
              <ToolProperties
                uiState={uiState}
                mapState={mapState}
                setUiState={setUiState}
                updateLayers={updateLayers}
              />
            )}
          </Navbar>
        }
        header={
          <HeaderMenu
            undo={undo}
            redo={redo}
            save={save}
            saveAs={saveAs}
            load={load}
            newDoc={newDoc}
            setUiState={setUiState}
          />
        }
      >
        {uiState.loaded && (
          <LayersPanel
            width={mapState.width}
            height={mapState.height}
            layers={mapState.layers}
            layerOrder={mapState.layerOrder}
            terrainBrushes={mapState.terrainBrushes}
            activeLayer={uiState.activeLayer}
            addNewLayer={(layer) => {
              updateLayers({ [layer.id]: layer }, [...mapState.layerOrder, layer.id])
            }}
            setActiveLayer={(id) => setUiState((s) => ({ ...s, activeLayer: id }))}
          />
        )}
        {RENDER_TERRAIN_DEBUG && <SavePreviews layers={mapState.layers} />}
        <PixiCanvas
          uiState={uiState}
          mapState={mapState}
          updateLayers={updateLayers}
          pushUndo={push}
          setApp={setApp}
        />
        {!uiState.loaded && (
          // TODO: Turn into links
          <Box sx={{ position: 'absolute', top: '50%', left: '50%' }}>
            Open existing or create new map
          </Box>
        )}
        <Modals
          uiState={uiState}
          setUiState={setUiState}
          userPreferences={userPreferences}
          setUserPreferences={setUserPreferences}
          saveUserPreferences={saveUserPreferences}
        />
      </AppSkeleton>
    </MantineProvider>
  )
}

export default App
