import { TOOL } from '@renderer/utils/tools'
import { Texture } from 'pixi.js'

export interface MapState {
  background: {
    // Texture to render on the background strata
    texture?: Texture
    // Array of fill texture paths that maps to the fillMap, for serializing the texture
    fills: Array<FillTexture>
    // Array of pixels, each pixel an integer that maps to the fills array, for serializing the texture
    fillMap?: null
  }
  objects: any
}

// A user-provided texture that we use to render a fill.
export interface FillTexture {
  id: string
  path: string
  // Loaded texture
  pixels?: Uint8Array
  texture?: Texture
  // Might have preview png in here as well
}

export interface UiState {
  activeTool: TOOL
  activeFill: number
}
