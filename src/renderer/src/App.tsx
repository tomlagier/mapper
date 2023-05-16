import Versions from './components/Versions'
import icons from './assets/icons.svg'
import { PixiCanvas } from './components/PixiCanvas'
import { AppShell, Header, MantineProvider, NavLink, Navbar, createStyles } from '@mantine/core'
import { Manatee } from './components/ManateeComponent'
import { useEffect, useRef, useState } from 'react'
// import { Test } from './components/Test'
import { Aiming, BarberBrush } from '@icon-park/react'
import { useTick } from '@pixi/react'
import { TOOLS } from './utils/tools'

function App(): JSX.Element {
  const [state, setState] = useState({
    activeTool: TOOLS.TERRAIN_BRUSH
  })

  return (
    <MantineProvider>
      <AppShell
        padding="0px"
        navbar={
          <Navbar width={{ base: 300 }} p="md">
            <NavLink label="Brush" icon={<BarberBrush />} />
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
        <PixiCanvas activeTool={state.activeTool} />
      </AppShell>
    </MantineProvider>
  )
}

export default App
