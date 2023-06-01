// Returns an array of circles that are randomly placed around a center point
// What dungeondraft does instead of this is just layers opacity, stronger in the center, weaker towards the edge
// Then has 2 blend modes - not smooth, which has a sharp pixel cutoff for opacity (e.g. drop anything below 70%), and smooth
// which just shows the opacity as it is.
// I'm not sure if I can achieve a similar effect with Pixi - I'd need to maybe blur the edges of the circles?
// But that feels likely to be prohibitively expensive
export function getSplatterCircles({ splatterAmount, splatterRadius, x, y, size, viewport }) {
  // Translate X,Y to world space
  const { x: worldX, y: worldY } = viewport.toWorld(x, y)

  // Translate splatterRadius to world scale
  let dx,
    dy,
    r,
    // s,
    t
  const circles: Array<Array<number>> = []

  for (let i = splatterAmount; i > 0; i--) {
    t = Math.random() * 2 * Math.PI
    r = Math.random()
    dx = r * Math.cos(t) * splatterRadius
    dy = r * Math.sin(t) * splatterRadius
    // TODO: I want the circles to follow a different curve as they get further away from the center
    // It should be big closer and much smaller further away
    // s = 1 - Math.sqrt(dx * dx + dy * dy) / splatterRadius

    circles.push([worldX + dx, worldY + dy, size])
  }

  return circles
}
