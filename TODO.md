TODO:

- Create/save/load a file
- Brush tool to draw on canvas
- Save results of brush tool to file (how to save it? could be path/points or could just be raster image)

  - Best: as path/points, though harder
  - Allows for swapping out textures from different brushes (very nice DD feature)

x Need to fix event coordinates and texture coordinates to be based on world position instead of screen position

- pointerup not checking whether we were previously dragging
  x Ghosting of white circles
  - Probably due to order in which the layers are painted. Need to add first, then subtract
    x Lock map bounds so you can't go all the way away
    x Arbitrary size texture inputs

x Viewport fit whole panel

How to architect save:
x Menu option for save / load (add back undo/redo as well??)

x Need location & name of file to save ( use main thread dialog https://www.electronjs.org/docs/latest/api/dialog#dialogshowsavedialogbrowserwindow-options-callback )
x Save function that serializes the app state and sends it over to the main thread to be written

- Move into worker possibly
  x Main thread writes file
  x Current file path in main thread state??
  x Keybind for save triggers save handler

Load:

x Menu or keybind triggers load
x Open file dialog
x When selected, file is loaded & sent to renderer via IPC
x Handler restores app state from file

Cleanup:

x Fix lazy types
x Save/load cleanup
x Frag shader dedupe
x Another terrain brush cleanup pass
x Handle out of bounds drag events, global drag handler
x Resize event handler to full canvas, then map x,y to world space - Too much work for now, address when becomes an issue. - Might need to split draw/render into separate state, have draw operate above viewport & render operate below - Re-evaluate w/object placement

x Tools to select

x Tool options

x Layers?
Rework fills yet again:
x Probably rename to terrain brushes
x Set of loaded terrain brushes
x Set of layers
x Layer has type object or terrain
x If terrain, has associated brush & uses brush filter to render
x If object, TBD

x PixiCanvas iterates over layers, renders appropriately (Object or Terrain)
x TerrainBrush is just the layer that sits over the other layers & draws
x Gotta figure out how to hide circles somewhere..

- Create new layer: Object or terrain
- Set active layer
- Set background brush
- Custom / upload brush textures
