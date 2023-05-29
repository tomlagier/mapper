import { PixiCanvas } from './components/PixiCanvas'
import { Button, Header, MantineProvider, NavLink, Navbar } from '@mantine/core'
import { BarberBrush } from '@icon-park/react'
import { useAppState } from './hooks/useAppState'
import { AppSkeleton } from './components/AppSkeleton'
import { HeaderMenu } from './components/HeaderMenu'
import { useUndo } from '@renderer/utils/undo'

function App(): JSX.Element {
  const { mapState, uiState, setUiState, setFillTextures } = useAppState()
  const { push, undo, redo } = useUndo()

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
        header={<HeaderMenu undo={undo} redo={redo} />}
      >
        <PixiCanvas
          uiState={uiState}
          mapState={mapState}
          setFillTextures={setFillTextures}
          pushUndo={push}
        />
      </AppSkeleton>
    </MantineProvider>
  )
}

export default App
