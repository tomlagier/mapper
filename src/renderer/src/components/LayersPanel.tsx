import { Layer } from '@renderer/types/state'
import { Dialog } from '@mantine/core'
import { Box } from '@icon-park/react'

interface LayersPanelProps {
  layers: Record<string, Layer>
  layerOrder: string[]
}
export function LayersPanel({ layers, layerOrder }: LayersPanelProps) {
  return (
    <Dialog opened size="lg">
      {layerOrder.map((layerId) => {
        const layer = layers[layerId]
        return (
          <Box key={layer.id}>
            {layer.name} - {layer.type}
          </Box>
        )
      })}
    </Dialog>
  )
}
