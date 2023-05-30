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

Set background
Preferences
New document dialog
Tool panel system

- Tools to select
- Tool options
- Layers?

- Set background
- Custom / upload brush textures

Cleanup:

- Fix lazy types
- Save/load cleanup
  - Frag shader dedupe
- Another terrain brush cleanup pass
  - Handle out of bounds drag events, global drag handler
    - Resize event handler to full canvas, then map x,y to world space
