import { Layer, LayerTypes, TerrainBrush, TerrainLayer } from '@renderer/types/state'
import {
  Button,
  Dialog,
  Modal,
  Select,
  TextInput,
  Title,
  Box,
  SegmentedControl
} from '@mantine/core'
import { useState } from 'react'
import { useForm } from '@mantine/form'
import { FORMATS, MSAA_QUALITY, RenderTexture } from 'pixi.js'

// TODO: Need to be able to undo & redo adding a new layer?
interface LayersPanelProps {
  width: number
  height: number
  layers: Record<string, Layer>
  layerOrder: string[]
  terrainBrushes: Record<string, TerrainBrush>
  activeLayer: string
  addNewLayer: (layer: Layer) => void
  setActiveLayer: (layerId: string) => void
}
export function LayersPanel({
  width,
  height,
  layers,
  layerOrder,
  activeLayer,
  terrainBrushes,
  addNewLayer,
  setActiveLayer
}: LayersPanelProps) {
  const [addLayerModalVisible, setAddLayerModalVisible] = useState(false)

  const defaultBrush = Object.keys(terrainBrushes)[0]

  const form = useForm({
    initialValues: {
      brush: defaultBrush,
      type: LayerTypes.TERRAIN,
      name: 'New layer'
    }
  })

  const onModalOpen = () => {
    form.reset()
    setAddLayerModalVisible(true)
  }

  const onModalClose = () => {
    setAddLayerModalVisible(false)
  }

  const onSubmit = () => {
    const { brush, type, name } = form.getTransformedValues()
    const layer: Layer = {
      id: Math.floor(Math.random() * 1000000).toString(),
      name,
      type,
      brush,
      texture: RenderTexture.create({
        width,
        height,
        multisample: MSAA_QUALITY.HIGH,
        resolution: window.devicePixelRatio,
        format: FORMATS.RED
      })
    }
    addNewLayer(layer)
    setActiveLayer(layer.id)
    setAddLayerModalVisible(false)
  }

  return (
    <>
      <Dialog opened size="lg">
        <Title order={4}>Layers</Title>
        <SegmentedControl
          orientation="vertical"
          w="100%"
          data={[...layerOrder]
            // Because 0 is the bottom layer, we need to reverse the order for better display
            // in the layer control
            .reverse()
            .map((layerId) => ({ label: layers[layerId].name, value: layerId }))}
          value={activeLayer}
          onChange={setActiveLayer}
        />
        <Button onClick={onModalOpen}>Add new layer</Button>
      </Dialog>
      <Modal opened={addLayerModalVisible} onClose={onModalClose}>
        <form onSubmit={onSubmit}>
          <Title>Add new layer</Title>
          <TextInput label="Layer name" {...form.getInputProps('name')} />
          <Select
            data={[
              { label: 'Terrain', value: LayerTypes.TERRAIN },
              { label: 'Object', value: LayerTypes.OBJECT }
            ]}
            label="Layer type"
            {...form.getInputProps('type')}
          />
          <Select
            data={Object.values(terrainBrushes).map((brush) => ({
              label: brush.name,
              value: brush.id
            }))}
            label="Brush"
            {...form.getInputProps('brush')}
          />
          <Button type="submit">Add layer</Button>
        </form>
      </Modal>
    </>
  )
}
