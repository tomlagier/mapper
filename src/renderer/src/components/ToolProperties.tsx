import { MapState, UiState } from '@renderer/types/state'
import { TOOLS } from '@renderer/utils/tools'
import { Button, Box } from '@mantine/core'
import { SetUiState } from '@renderer/hooks/useAppState'

interface ToolPropertiesProps {
  uiState: UiState
  mapState: MapState
  setUiState: SetUiState
}

export function ToolProperties({ uiState, mapState, setUiState }: ToolPropertiesProps) {
  return (
    <Box mt={8} w="100%">
      {getActiveToolProperties({ uiState, mapState, setUiState })}
    </Box>
  )
}

function getActiveToolProperties({ uiState, mapState, setUiState }) {
  switch (uiState.activeTool) {
    case TOOLS.TERRAIN: {
      return Object.keys(mapState.background.fills).map((id) => (
        <Button
          variant={uiState.activeFill === id ? 'filled' : 'subtle'}
          key={id}
          onClick={() => setUiState((s) => ({ ...s, activeFill: id }))}
        >
          {id}
        </Button>
      ))
    }
    case TOOLS.OBJECTS:
    default:
      return null
  }
}
