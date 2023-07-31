TODO:

x Create/save/load a file
x Brush tool to draw on canvas
x Save results of brush tool to file (how to save it? could be path/points or could just be raster image)

  x Best: as path/points, though harder
  x Allows for swapping out textures from different brushes (very nice DD feature)

x Need to fix event coordinates and texture coordinates to be based on world position instead of screen position

x pointerup not checking whether we were previously dragging
  x Ghosting of white circles
  x Probably due to order in which the layers are painted. Need to add first, then subtract
    x Lock map bounds so you can't go all the way away
    x Arbitrary size texture inputs

x Viewport fit whole panel

How to architect save:
x Menu option for save / load (add back undo/redo as well??)

x Need location & name of file to save ( use main thread dialog https://www.electronjs.org/docs/latest/api/dialog#dialogshowsavedialogbrowserwindow-options-callback )
x Save function that serializes the app state and sends it over to the main thread to be written

x Move into worker possibly
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

x Create new layer: Object or terrain
x Set active layer
- Set background brush
- Custom / upload brush textures
- Fix ghosting againSQL

Uploading brush textures:
- Need to have metadata in save file for brush textures
- Do we bundle the textures with the file? Or do we just have a list of textures that need to be loaded?
  - Advantage of bundling is that it's easier to share the file
  - Disadvantage is that it's a bigger file
  - For now, let's not bundle it, we'll just store the texture names/paths in the file


Strategy for custom assets:
- Designate a filesystem folder & structure for custom assets
  - Types of custom assets:
    - Textures
      - Any image file? Webp / PNG / JPG
      - Advanced: Would be sick to support GIFs, need to research how we could do with Pixi
    - Patterns? Are patterns different?
      - Brush is, we fill closed polygon
        - Circle, square, free poly
          - Free poly - can it support curves?
      - Need to be able to scroll the underlying texture, key difference w/DD
      - Maybe just use same pool of textures for now, no need to differentiate
      - Free transform after placement
      - Stroke with path
    - Paths?
      - Probably worth differentiating from textures b/c how they need to tile
      - Free poly, width, width control points at each point!!
      - Free transform after placement!
    - Objects
      - Free transform after placement
      - Scatter tool
      - Grow/shrink
      - Easy drag/drop ordering
      - Easy grouping
      - Colorable
    - Text
      - System fonts
      - Free transform after placement
      - Would be nice to render on path
    - Advanced: Portals
      - Do we need this? Can we just draw the path and overlap w/portal?
      - Probably need
    - Advanced: Lights / Effects / Shadows
      - Lights: Just place glow & render intensity. Can probably just be an object
      - Shadows: 2 options. 1 is some preset texture brushes. 2 is selecting object/pattern/path and giving it a drop shadow
        - Offset, blur, spread, color, opacity.
        - Very important to be able to copy the shadow properties!!
        - PixiJS.DropShadowFilter
      - Torches etc? Object GIF + light
        - Maybe worth grouping light + object
- UI option for loading file that moves to the designated custom assets folder
- UI option for archiving the custom assets folder. FUTURE: Cloud support for custom assets
- FUTURE: Consider bundling custom asset folder or only used assets with file, for now skip
- Loaded custom assets persisted in save file
- Also need an editor state file (in tmp dir?) that persists editor defaults
  - Consider SQLite? Probs not actually, makes web port harder. Would be nice to have a schema though, particularly for
    objects.
- Save to `app.getPath('userData')`

Custom assets directory:
- metadata.json
- textures/
- paths/
- objects/
- packs/

Individual asset:
- textures (avif, webp, png, jpg, gif, svg)
- OR directory with ordered textures that we use for an animated sprite

Replicate directory structure in each asset pack

Tools:
- Texture
- Object
- Pattern
- Path
- Portal
- Light? Effect?

Export:
- Foundry
- JPG

Need better system for loading than baking assets into the binary

Flow:
- On load:
  - Allow user to select custom assets directory if DNE
    - Save to user data
  - Load manifest of available assets

- On new project
  - Select background
  - Select asset packs to load
  - Load metadata of selected assets into state & write to save file
  - Thumbnails for assets? Just render image tag?
  - Need to rig up custom protocol to allow for runtime loading of these images

- On project load
  - Check if custom assets from save file are available
    - If not, alert user
    - Replace missing assets with black texture or X texture
  - Load metadata of selected assets into state
  - Load assets in save file to Pixi
    - Should we load on use or upfront? Leaning towards on use - Pixi already does this? Also detects dimensions?

Roadmap:
- User data integration
- Default & custom asset pack support
  - New document
  - Save
  - Load
- Custom terrain brushes
- New document size
- Export to JPG
- Patterns after terrain brushes
- Then objects
- Then paths
- Export to DD
- Ship it!

- Objects
  - Reconsider layers
  - Simple sprite import
  - Cursor preview
  - Control points, resize, & transform
    - Schema: transform, alpha, color
    - https://jedateach.github.io/pixijs-free-transform-tool/
    - https://www.html5gamedevs.com/topic/44077-fabricjs-select-and-transform-suggestions-in-pixijs/
    - 3d transform probably needs to wait until the examples for pixi-projection are fixed. Shouldn't be too hard to upgrade later though integration with react-pixi TBD
    - Could also achieve through mesh but a lot more work
- Patterns
  - Backed by Pixi graphics mask over TilingSprite
    - TilingSprite expands over the bounding box of the graphics
    - Graphics mask is a polygon w/control points & options for how it's drawn
  - x,y sprite offset - need to hammer on filter more
  - Need to be able to draw free polygon, + circle & square
  - TilingSprite w/mask might also work well
    - Could we use TilingSprite w/mask for terrain brushes too?
    - Need to save splatter pattern mask out anyway but using TilingSprite as base might simplify the filter & scale logic
- Paths
  - SimpleRope FTW!!
  - Need to figure out how the tiling works (REPEAT wrap mode?)
  - Also being able to grow at points would be huge, maybe can't do though
    - Could use mesh for this, lot of work but might just need to learn how to do it
    - Looking like mesh might be the way to go to achieve the scaling I want
- Text
  - Can use SimpleRope for this too maybe
  - BitmapText -> RenderTexture -> SimpleRope?

Pixi can do image cursor maybe? Scaling might be tough