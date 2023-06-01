import { TOOL } from '@renderer/utils/tools'
import { Filter, RenderTexture, Texture } from 'pixi.js'

export interface MapState {
  background: {
    // Texture to render on the background strata
    texture?: Texture
    // Array of fill texture paths that maps to the fillMap, for serializing the texture
    fills: Record<string, FillTexture>
  }
  // TODO: Support this
  // objects: any
  width: number
  height: number
}

// A user-provided texture that we use to render a fill.
export interface FillTexture {
  // Path, gets by loaded
  path: string
  // Render texture of canvas area
  texture?: RenderTexture
  // Filter used to display the texture by mapping the bitmap to the till image
  filter?: Filter
  // Size of the fill texture
  size: number
  // Debug only, serialized canvas data for each fill layer.
  // Needs a small (< 200) canvas to work well
  canvas?: string
}

export interface UiState {
  activeTool: TOOL
  activeFill: string
  filePath?: string | null
}
