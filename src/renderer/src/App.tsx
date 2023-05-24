import { PixiCanvas } from './components/PixiCanvas'
import { AppShell, Button, Header, MantineProvider, NavLink, Navbar } from '@mantine/core'
import { useEffect, useState } from 'react'
import { BarberBrush } from '@icon-park/react'
import { TOOLS } from './utils/tools'
import { MapState, UiState } from './types/state'
import { DEFAULT_FILLS } from './utils/fills'
import { useAppState } from './hooks/useAppState'

function App(): JSX.Element {
  const { mapState, uiState, setUiState, setFillTextures } = useAppState()

  return (
    <MantineProvider>
      <AppShell
        padding="0px"
        navbar={
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
        styles={(theme) => ({
          main: {
            backgroundColor:
              theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0]
          }
        })}
      >
        <PixiCanvas uiState={uiState} mapState={mapState} setFillTextures={setFillTextures} />
      </AppShell>
    </MantineProvider>
  )
}

export default App
