export const TOOLS = {
  TERRAIN_BRUSH: 'TERRAIN_BRUSH'
} as const

export type TOOL = (typeof TOOLS)[keyof typeof TOOLS]
