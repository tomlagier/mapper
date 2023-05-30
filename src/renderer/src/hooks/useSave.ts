import { MapState, UiState } from '@renderer/types/state'
import { useEffect, useState } from 'react'
import { SetMapState, SetUiState } from './useAppState'
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
import { useHotkeys } from 'react-hotkeys-hook'
import { getModKey } from '@renderer/utils/modkey'
import { Texture } from 'pixi.js'

export function useSave(
  setUiState: SetUiState,
  setMapState: SetMapState,
  mapState: MapState,
  uiState: UiState,
  app?: Application
) {
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  // Bind handlers to save
  useEffect(() => {
    window.api.onSaveLocationSet((e, path) => {
      setUiState((s) => ({
        ...s,
        filePath: path
      }))
    })

    window.api.onSaveComplete(() => setSaving(false))
    // TODO: Cleaner handling of this
    window.api.onLoad(async (e, file) => {
      const mapState = await deserializeMapState(file, app!)
      setMapState((s) => mapState)
    })

    return () => {
      window.api.clearSaveLocationSet()
      window.api.clearSaveComplete()
      window.api.clearLoad()
    }
  }, [app])

  // Return save functions
  async function save() {
    if (!uiState.filePath) return saveAs()

    setSaving(true)
    const serializedState = await serializeMapState(app!.renderer.extract, mapState)
    window.api.save(serializedState, uiState.filePath)
    setSaving(false)
  }

  async function saveAs() {
    setSaving(true)
    const serializedState = await serializeMapState(app!.renderer.extract, mapState)
    window.api.saveAs(serializedState)
    setSaving(false)
  }

  async function load() {
    setLoading(true)
    window.api.load()
  }

  useHotkeys(`${getModKey()}+s`, () => save(), [app, mapState, uiState])
  useHotkeys(`${getModKey()}+shift+s`, () => saveAs(), [app, mapState, uiState])
  useHotkeys(`${getModKey()}+o`, () => load(), [app, mapState, uiState])

  return { save, saveAs, load, saving, loading }
}

async function serializeMapState(extract: IExtract, mapState: MapState): Promise<string> {
  const serializedFills = []

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

async function deserializeMapState(fileContents: string, app: Application): Promise<MapState> {
  const rawState = JSON.parse(fileContents)
  const { width, height } = rawState
  const inflatedFills = rawState.background.fills.reduce((all, fill) => {
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

    app.renderer.render(new Sprite(texture), {
      renderTexture,
      blit: true,
      clear: false
    })

    const filter = new Filter(undefined, fragShader, {
      sample: Texture.from(fill.path),
      scale: width / fill.size,
      dimensions: [width, height]
    })
    filter.resolution = 2
    filter.autoFit = false

    all[fill.id] = {
      path: fill.path,
      size: fill.size,
      filter,
      texture: renderTexture
    }

    return all
  }, {})

  rawState.background.fills = inflatedFills

  return rawState
}

// TODO: Dedupe
const fragShader = `
precision mediump float;

varying vec2 vTextureCoord;
varying vec4 vColor;

uniform sampler2D uSampler;
uniform sampler2D sample;
uniform float scale;

void main(void)
{
  vec4 sourcePixel = texture2D(uSampler, vTextureCoord);

  // Ignore full transparent pixels
  if(sourcePixel.a == 0.0) discard;

  vec2 sampleCoords = fract(vTextureCoord * scale);
  vec4 samplePixel = texture2D(sample, sampleCoords);

  vec4 result = vec4(samplePixel.rgb * sourcePixel.r * sourcePixel.a, sourcePixel.r * sourcePixel.a);

  gl_FragColor = result;
}
`
