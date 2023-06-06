import { PixiCanvas } from './components/PixiCanvas'
import { MantineProvider, Divider, Navbar } from '@mantine/core'
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

function App(): JSX.Element {
  // State
  const { mapState, uiState, setUiState, setMapState, setFillTextures, setActiveTool } =
    useAppState()
  // Pixi app
  const [app, setApp] = useState<Application>()

  const { push, undo, redo, clear } = useUndo()
  const { save, saveAs, load, newDoc } = useSave({
    setUiState,
    setMapState,
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
            <ToolSelector activeTool={uiState.activeTool} setActiveTool={setActiveTool} />
            <Divider />
            <ToolProperties uiState={uiState} mapState={mapState} setUiState={setUiState} />
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
          />
        }
      >
        {RENDER_TERRAIN_DEBUG && <SavePreviews fills={mapState.background.fills} />}
        <PixiCanvas
          uiState={uiState}
          mapState={mapState}
          setFillTextures={setFillTextures}
          pushUndo={push}
          setApp={setApp}
        />
      </AppSkeleton>
    </MantineProvider>
  )
}

export default App
