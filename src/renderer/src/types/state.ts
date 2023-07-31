import { Tool } from '@renderer/utils/tools'
import { Filter, RenderTexture } from 'pixi.js'

// Default terrain brushes
import grass from '@renderer/assets/default/textures/grass1.png'
import stones from '@renderer/assets/default/textures/stones.png'
import red from '@renderer/assets/default/textures/red.webp'
import blue from '@renderer/assets/default/textures/blue.webp'

export interface MapState {
  terrainBrushes: Record<string, TerrainBrush>
  layers: Record<string, Layer>
  layerOrder: string[]
  width: number
  height: number
}

// A user-provided texture that we use to render a fill.
export interface TerrainBrush {
  id: string
  // Path, gets by loaded
  path: string
  // Filter used to display the texture by mapping the bitmap to the till image
  filter?: Filter
  // Size of the fill texture
  size: number
  name: string
}

export const LayerTypes = {
  TERRAIN: 'TERRAIN',
  OBJECT: 'OBJECT'
} as const

export type LayerType = (typeof LayerTypes)[keyof typeof LayerTypes]

export interface ILayer {
  type: LayerType
  id: string
  name: string
}

export interface TerrainLayer extends ILayer {
  type: 'TERRAIN'

  // ID of the TerrainBrush used to render
  brush: string

  // Render texture of canvas area
  texture?: RenderTexture
  // Debug only, serialized canvas data for each layer.
  // Needs a small (< 200) canvas to work well
  canvas?: string
}

export interface ObjectLayer extends ILayer {
  type: 'OBJECT'
}

export type Layer = TerrainLayer | ObjectLayer

export interface UiState {
  activeTool: Tool
  activeLayer: string
  filePath?: string | null
  loaded: boolean
}

export const DEFAULT_TERRAIN_BRUSHES: Record<string, TerrainBrush> = {
  grass: {
    id: 'grass',
    path: grass,
    size: 64,
    name: 'Grass'
  },
  stones: {
    id: 'stones',
    path: stones,
    size: 32,
    name: 'Stones'
  },
  blue: {
    id: 'blue',
    path: blue,
    size: 4,
    name: 'Blue'
  },
  red: {
    id: 'red',
    path: red,
    size: 4,
    name: 'Red'
  }
}

export const DEFAULT_LAYER_ID = 'background'
export const DEFAULT_LAYER_ORDER = [DEFAULT_LAYER_ID]
