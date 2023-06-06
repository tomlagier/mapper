export const Tools = {
  TERRAIN: 'TERRAIN',
  OBJECTS: 'OBJECTS'
} as const

export type Tool = (typeof Tools)[keyof typeof Tools]
