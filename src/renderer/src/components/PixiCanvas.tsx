import { Stage } from '@pixi/react'
import { TOOLS, TOOL } from '../utils/tools'
import { TerrainBrush } from './TerrainBrush'
import { useEffect, useState } from 'react'
import { UndoCommand, useUndo, useUndoStack } from '@renderer/utils/undo'

// Basic algorithm for brush:
// - Maintain mapping of color to texture
// - On mouse down, depending on scatter, paint color that references the texture onto canvas
// - When rendering canvas, look up color in mapping and render texture by pixel coordinates, looping
//    where necessary
// - Inputs: texture array, array index, mouse position, backing pixel array
// - Outputs: Rendered raster image of background
interface PixiCanvasProps {
  activeTool: TOOL
}

export function PixiCanvas({ activeTool }: PixiCanvasProps) {
  const width = 400
  const height = 400

  // TODO: Handle viewport
  // TODO: Each tool handles its own cursor
  // TODO: Each tool handles its own pointer events
  // TODO: Global undo/redo stack, use context to pass undo/redo functions to tools

  const { push } = useUndo()
  return (
    <Stage
      width={width}
      height={height}
      options={{ backgroundColor: 0x1099bb, antialias: true, resolution: 2 }}
    >
      {activeTool === TOOLS.TERRAIN_BRUSH && (
        <TerrainBrush width={width} height={height} setCursor={() => {}} pushUndo={push} />
      )}
    </Stage>
  )
}
