import { Tool } from '@renderer/utils/tools'
import { Filter, RenderTexture } from 'pixi.js'

export interface MapState {
  terrainBrushes: TerrainBrush[]
  layers: Layer[]
  width: number
  height: number
}

// A user-provided texture that we use to render a fill.
export interface TerrainBrush {
  // Path, gets by loaded
  path: string
  // Filter used to display the texture by mapping the bitmap to the till image
  filter?: Filter
  // Size of the fill texture
  size: number
  // Render texture of canvas area
  texture?: RenderTexture
}

export const LayerTypes = {
  TERRAIN: 'TERRAIN',
  OBJECT: 'OBJECT'
} as const

export type LayerType = (typeof LayerTypes)[keyof typeof LayerTypes]

export interface ILayer {
  type: LayerType
  index: number
}

export type TerrainLayer = ILayer & {
  // Render texture of canvas area
  texture?: RenderTexture
  // Debug only, serialized canvas data for each layer.
  // Needs a small (< 200) canvas to work well
  canvas?: string
}

export type ObjectLayer = ILayer & {
  // objects: Object[]
}

export type Layer = TerrainLayer | ObjectLayer

export interface UiState {
  activeTool: Tool
  activeFill: string
  filePath?: string | null
  loaded: boolean
}
