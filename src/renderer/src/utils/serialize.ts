import { Layer, LayerType, LayerTypes, MapState, TerrainBrush } from '@renderer/types/state'
import {
  Application,
  BaseTexture,
  FORMATS,
  Filter,
  IExtract,
  MSAA_QUALITY,
  RenderTexture,
  Sprite
} from 'pixi.js'
import cloneDeep from 'lodash/cloneDeep'
import { frag } from '@renderer/utils/terrainShader'
import { Texture, Graphics } from 'pixi.js'

interface SerializedTerrainLayer {
  id: string
  brush: string
  texture: string
  type: 'TERRAIN'
}

interface SerializedObjectLayer {
  id: string
  type: 'OBJECT'
  // TODO: Support object layers
  // objects: any
}

type SerializedLayer = SerializedTerrainLayer | SerializedObjectLayer

interface SerializedBrush {
  // TODO: Need a good way of carrying around packs of brushes
  id: string
  path: string
  size: number
}

interface SerializedMapState {
  terrainBrushes: SerializedBrush[]
  layers: SerializedLayer[]
  layerOrder: string[]
  width: number
  height: number
}

export async function serializeMapState(extract: IExtract, mapState: MapState): Promise<string> {
  const serializedLayers: SerializedLayer[] = []

  for (const [id, layer] of Object.entries(mapState.layers)) {
    let serializedLayer
    if (layer.type === LayerTypes.TERRAIN) {
      const texture = await extract.base64(layer.texture, 'image/webp', 1)
      serializedLayer = {
        id,
        texture,
        brush: layer.brush,
        type: layer.type
      }
    }

    serializedLayers.push(serializedLayer)
  }

  const serializedBrushes: SerializedBrush[] = []

  for (const [id, brush] of Object.entries(mapState.terrainBrushes)) {
    serializedBrushes.push({
      id,
      path: brush.path,
      size: brush.size
    })
  }

  const copy = cloneDeep(mapState)
  copy.layers = serializedLayers
  copy.terrainBrushes = serializedBrushes
  const serialized = JSON.stringify(copy)

  // TODO: See if we need fancier memory constructs
  return serialized
}

export async function deserializeMapState(
  fileContents: string,
  app: Application
): Promise<MapState> {
  const rawState = JSON.parse(fileContents) as SerializedMapState
  const { width, height } = rawState
  const restoredTerrainBrushes: Record<string, TerrainBrush> = {}
  for (const brush of rawState.terrainBrushes) {
    restoredTerrainBrushes[brush.id] = {
      id: brush.id,
      path: brush.path,
      size: brush.size,
      filter: createFilter({ brush, width, height })
    }
  }

  const restoredLayers: Record<string, Layer> = {}
  for (const layer of rawState.layers) {
    // TODO: Support object layers
    if (layer.type !== LayerTypes.TERRAIN) continue

    const renderTexture = RenderTexture.create({
      width: width,
      height: height,
      multisample: MSAA_QUALITY.HIGH,
      resolution: window.devicePixelRatio,
      format: FORMATS.RED
    })

    const img = new Image(width, height)
    img.src = layer.texture || ''
    const base = BaseTexture.from(img)
    const texture = Texture.from(base)

    // Wait for textures to be ready
    await new Promise((res) => {
      if (texture.valid) {
        res(null)
      } else {
        texture.on('update', res)
      }
    })

    app.renderer.render(new Sprite(texture), {
      renderTexture,
      blit: true,
      clear: false
    })

    restoredLayers[layer.id] = {
      brush: layer.brush,
      id: layer.id,
      type: layer.type,
      texture: renderTexture
    }
  }

  const mapState = {
    terrainBrushes: restoredTerrainBrushes,
    layers: restoredLayers,
    layerOrder: rawState.layerOrder,
    width,
    height
  }

  return mapState
}

// Initialize the terrain brushes with filters
interface CreateTerrainBrushesArgs {
  mapState: MapState
}

export function createTerrainBrushes({
  mapState
}: CreateTerrainBrushesArgs): Record<string, TerrainBrush> {
  const brushes: Record<string, TerrainBrush> = {}
  const { width, height } = mapState

  for (const [id, brush] of Object.entries(mapState.terrainBrushes)) {
    brushes[id] = {
      filter: createFilter({ brush, width, height }),
      id,
      path: brush.path,
      size: brush.size
    }
  }

  return brushes
}

interface CreateFilterArgs {
  brush: TerrainBrush
  width: number
  height: number
}

function createFilter({ brush, width, height }: CreateFilterArgs): Filter {
  const filter = new Filter(undefined, frag, {
    sample: Texture.from(brush.path),
    scale: width / brush.size,
    dimensions: [width, height]
  })

  filter.resolution = 2
  filter.autoFit = false

  return filter
}

// Initialize the renderTextures and filters used for each loaded layer.
interface CreateLayersArgs {
  mapState: MapState
  // For default texture generation
  app: Application
  // ID of the layer to set as background
  backgroundId: string
}
export async function createLayers({
  mapState,
  app,
  backgroundId
}: CreateLayersArgs): Promise<Record<string, Layer>> {
  const layers: Record<string, Layer> = {}
  const { width, height } = mapState

  // TODO: Only create background layer once we can add layers
  for (const [id, brush] of Object.entries(mapState.terrainBrushes)) {
    // TODO: Support object layers

    const renderTexture = RenderTexture.create({
      width,
      height,
      multisample: MSAA_QUALITY.HIGH,
      resolution: window.devicePixelRatio,
      format: FORMATS.RED
    })

    // If fill should default to filled in (i.e. is background), fill it.
    if (id === backgroundId && app) {
      const g = new Graphics().beginFill(0xffffff).drawRect(0, 0, width, height).endFill()
      app.renderer.render(g, { renderTexture, blit: true })
    }

    layers[id] = {
      type: LayerTypes.TERRAIN,
      // TODO: Think about layer ID generation better
      id: Math.floor(Math.random() * 1000000).toString(),
      brush: brush.id,
      texture: renderTexture
    }
  }

  return layers
}
