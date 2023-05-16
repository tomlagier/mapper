// Returns an array of circles that are randomly placed around a center point
export function getSplatterCircles({ splatterAmount, splatterRadius, x, y, size }) {
  let dx, dy, r, s, t
  const circles: Array<Array<number>> = []

  for (let i = splatterAmount; i > 0; i--) {
    t = Math.random() * 2 * Math.PI
    r = Math.random()
    dx = r * Math.cos(t) * splatterRadius
    dy = r * Math.sin(t) * splatterRadius
    s = 1 - Math.sqrt(dx * dx + dy * dy) / splatterRadius
    circles.push([x + dx, y + dy, size * s])
  }

  return circles
}
