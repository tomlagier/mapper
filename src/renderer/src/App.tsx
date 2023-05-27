import { PixiCanvas } from './components/PixiCanvas'
import { AppShell, Button, Header, MantineProvider, NavLink, Navbar } from '@mantine/core'
import { useEffect, useState } from 'react'
import { BarberBrush } from '@icon-park/react'
import { TOOLS } from './utils/tools'
import { MapState, UiState } from './types/state'
import { DEFAULT_FILLS } from './utils/fills'
import { useAppState } from './hooks/useAppState'
import { AppSkeleton } from './components/AppSkeleton'

function App(): JSX.Element {
  const { mapState, uiState, setUiState, setFillTextures } = useAppState()

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
          <Header height={60} p="md">
            {/* Header content */}
          </Header>
        }
      >
        <PixiCanvas uiState={uiState} mapState={mapState} setFillTextures={setFillTextures} />
      </AppSkeleton>
    </MantineProvider>
  )
}

export default App
