import { PixiCanvas } from './components/PixiCanvas'
import { Button, Header, MantineProvider, NavLink, Navbar } from '@mantine/core'
import { BarberBrush } from '@icon-park/react'
import { useAppState } from './hooks/useAppState'
import { AppSkeleton } from './components/AppSkeleton'
import { HeaderMenu } from './components/HeaderMenu'
import { useUndo } from '@renderer/utils/undo'
import { useSave } from './hooks/useSave'
import { Application } from 'pixi.js'
import { useState } from 'react'
import { SavePreviews } from './components/SavePreviews'
import { RENDER_TERRAIN_DEBUG } from './config'

function App(): JSX.Element {
  // State
  const { mapState, uiState, setUiState, setMapState, setFillTextures } = useAppState()
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
            <NavLink label="Brush" icon={<BarberBrush />} />
            {Object.keys(mapState.background.fills).map((id) => (
              <Button
                color={uiState.activeFill === id ? 'green' : 'blue'}
                key={id}
                onClick={() => setUiState({ ...uiState, activeFill: id })}
              >
                {id}
              </Button>
            ))}
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
