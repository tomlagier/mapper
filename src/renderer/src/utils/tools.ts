export const TOOLS = {
  TERRAIN: 'TERRAIN',
  OBJECTS: 'OBJECTS'
} as const

export type TOOL = (typeof TOOLS)[keyof typeof TOOLS]
