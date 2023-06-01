import { FillTexture, MapState } from '@renderer/types/state'
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

// TODO: Update to layers
interface SerializedFill {
  id: string
  path: string
  size: number
  texture: string
}
export async function serializeMapState(extract: IExtract, mapState: MapState): Promise<string> {
  const serializedFills: SerializedFill[] = []

  for (const [id, fill] of Object.entries(mapState.background.fills)) {
    let texture

    if (fill.texture) {
      texture = await extract.base64(fill.texture, 'image/webp', 1)
    }

    serializedFills.push({
      id,
      path: fill.path,
      size: fill.size,
      texture
    })
  }

  const copy = cloneDeep(mapState)
  copy.background.fills = serializedFills
  const serialized = JSON.stringify(copy)

  // TODO: See if we need fancier memory constructs
  return serialized
}

export async function deserializeMapState(
  fileContents: string,
  app: Application
): Promise<MapState> {
  const rawState = JSON.parse(fileContents)
  const { width, height } = rawState
  const inflatedFills = {}
  for (const fill of rawState.background.fills) {
    const renderTexture = RenderTexture.create({
      width: width,
      height: height,
      multisample: MSAA_QUALITY.HIGH,
      resolution: window.devicePixelRatio,
      format: FORMATS.RED
    })

    const img = new Image(width, height)
    img.src = fill.texture
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

    const filter = new Filter(undefined, frag, {
      sample: Texture.from(fill.path),
      scale: width / fill.size,
      dimensions: [width, height]
    })
    filter.resolution = 2
    filter.autoFit = false

    inflatedFills[fill.id] = {
      path: fill.path,
      size: fill.size,
      filter,
      texture: renderTexture
    }
  }

  rawState.background.fills = inflatedFills

  return rawState
}

// Initialize the renderTextures and filters used for each loaded fill.
interface CreateFillsArgs {
  mapState: MapState
  backgroundId?: string
  // Only needed for default texture generation
  app?: Application
  filters?: boolean
  textures?: boolean
}
export function createFills({
  mapState,
  backgroundId,
  app,
  textures = true,
  filters = true
}: CreateFillsArgs): Record<string, Partial<FillTexture>> {
  const fills: Record<string, Partial<FillTexture>> = {}
  const { width, height } = mapState

  for (const [id, fill] of Object.entries(mapState.background.fills)) {
    fills[id] = {}
    // Generate textures for fill
    if (textures) {
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
      fills[id].texture = renderTexture
    }

    // Generate filters for fills
    if (filters) {
      const filter = new Filter(undefined, frag, {
        sample: Texture.from(fill.path),
        scale: width / fill.size,
        dimensions: [width, height]
      })

      filter.resolution = 2
      filter.autoFit = false

      fills[id].filter = filter
    }
  }

  return fills
}
