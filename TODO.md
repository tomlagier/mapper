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
- Handle out of bounds drag events
  x Arbitrary size texture inputs

x Viewport fit whole panel

How to architect save:
x Menu option for save / load (add back undo/redo as well??)

- Need location & name of file to save ( use main thread dialog https://www.electronjs.org/docs/latest/api/dialog#dialogshowsavedialogbrowserwindow-options-callback )
- Save function that serializes the app state and sends it over to the main thread to be written
  - Move into worker possibly
- Main thread writes file
- Current file path in main thread state??
- Keybind for save triggers save handler

Load:

- Menu or keybind triggers load
- Open file dialog
- When selected, file is loaded & sent to renderer via IPC
- Handler restores app state from file

Set background
