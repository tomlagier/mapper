import { Point as PixiPoint } from 'pixi.js'

export interface Point {
  x: number
  y: number
}

interface InterpolateArgs {
  point: Point
  magnitude: Point
  stepSize: number
}

// Generates a point on the line between origialX/Y and the current mouse position that
// is paintInterval px away from the last drawn point.
export function interpolate({ point, magnitude, stepSize }: InterpolateArgs): Point {
  const x = point.x + magnitude.x * stepSize
  const y = point.y + magnitude.y * stepSize

  return { x, y }
}

interface MagnitudeArgs {
  startPoint: Point
  endPoint: Point
}
export function getNormalizedMagnitude({ startPoint, endPoint }: MagnitudeArgs) {
  const v = new PixiPoint(endPoint.x - startPoint.x, endPoint.y - startPoint.y)
  const magnitude = Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2))
  const normalized = new PixiPoint(v.x / magnitude, v.y / magnitude)

  return normalized
}
