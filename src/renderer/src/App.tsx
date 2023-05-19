import { PixiCanvas } from './components/PixiCanvas'
import { AppShell, Button, Header, MantineProvider, NavLink, Navbar } from '@mantine/core'
import { useState } from 'react'
import { BarberBrush } from '@icon-park/react'
import { TOOLS } from './utils/tools'
import { MapState, UiState } from './types/state'
import { DEFAULT_FILLS } from './utils/fills'

function App(): JSX.Element {
  const [uiState, setUiState] = useState<UiState>({
    activeTool: TOOLS.TERRAIN_BRUSH,
    activeFill: Object.keys(DEFAULT_FILLS)[0]
  })

  // TODO: Save/load, each tool responsible for serializing its own state
  const [mapState, setMapState] = useState<MapState>({
    background: {
      fills: DEFAULT_FILLS
    },
    objects: null
  })

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
        <PixiCanvas uiState={uiState} mapState={mapState} setMapState={setMapState} />
      </AppShell>
    </MantineProvider>
  )
}

export default App
