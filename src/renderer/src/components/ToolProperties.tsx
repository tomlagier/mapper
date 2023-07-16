import { LayerTypes, MapState, UiState } from '@renderer/types/state'
import { Tools } from '@renderer/utils/tools'
import { Button, Box } from '@mantine/core'
import { SetUiState, UpdateLayers } from '@renderer/hooks/useAppState'

interface ToolPropertiesProps {
  uiState: UiState
  mapState: MapState
  setUiState: SetUiState
  updateLayers: UpdateLayers
}

export function ToolProperties({
  uiState,
  mapState,
  setUiState,
  updateLayers
}: ToolPropertiesProps) {
  return (
    <Box mt={8} w="100%">
      {getActiveToolProperties({ uiState, mapState, setUiState, updateLayers })}
    </Box>
  )
}

function getActiveToolProperties({
  uiState,
  mapState,
  setUiState,
  updateLayers
}: ToolPropertiesProps) {
  switch (uiState.activeTool) {
    case Tools.TERRAIN: {
      const activeLayer = mapState.layers[uiState.activeLayer]

      if (activeLayer.type !== LayerTypes.TERRAIN) return

      // TODO: Undo/redo. Possibly push undo/redo to updateLayers?
      return Object.keys(mapState.terrainBrushes).map((id) => (
        <Button
          variant={id === activeLayer.brush ? 'filled' : 'subtle'}
          key={id}
          onClick={() => updateLayers({ [uiState.activeLayer]: { brush: id } })}
        >
          {id}
        </Button>
      ))
    }
    case Tools.OBJECTS:
    default:
      return null
  }
}
