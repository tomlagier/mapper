TODO:

- Create/save/load a file
- Brush tool to draw on canvas
- Save results of brush tool to file (how to save it? could be path/points or could just be raster image)

  - Best: as path/points, though harder
  - Allows for swapping out textures from different brushes (very nice DD feature)

- Need to fix event coordinates and texture coordinates to be based on world position instead of screen position
- pointerup not checking whether we were previously dragging
- Ghosting of white circles
  - Probably due to order in which the layers are painted. Need to add first, then subtract
- Lock map bounds so you can't go all the way away
- Handle out of bounds drag events
- Arbitrary size texture inputs
- Viewport fit whole panel
