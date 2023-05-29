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

function App(): JSX.Element {
  // State
  const { mapState, uiState, setUiState, setMapState, setFillTextures } = useAppState()
  // Pixi app
  const [app, setApp] = useState<Application>()

  const { push, undo, redo } = useUndo()
  const { save, saveAs, load } = useSave(setUiState, setMapState, mapState, uiState, app)

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
        header={<HeaderMenu undo={undo} redo={redo} save={save} saveAs={saveAs} load={load} />}
      >
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
