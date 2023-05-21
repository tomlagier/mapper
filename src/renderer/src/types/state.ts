import { TOOL } from '@renderer/utils/tools'
import { Filter, RenderTexture, Texture } from 'pixi.js'

export interface MapState {
  background: {
    // Texture to render on the background strata
    texture?: Texture
    // Array of fill texture paths that maps to the fillMap, for serializing the texture
    fills: Record<string, FillTexture>
    // Array of pixels, each pixel an integer that maps to the fills array, for serializing the texture
    fillMap?: null
  }
  objects: any
}

// A user-provided texture that we use to render a fill.
export interface FillTexture {
  // Path, gets by loaded
  path: string
  // Render texture of canvas area
  texture?: RenderTexture
  // Filter used to display the texture by mapping the bitmap to the till image
  filter?: Filter
}

export interface UiState {
  activeTool: TOOL
  activeFill: string
}
