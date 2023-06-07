import { Landscape, Local } from '@icon-park/react'
import { NavLink } from '@mantine/core'
import { SetActiveTool } from '@renderer/hooks/useAppState'
import { Tool, Tools } from '@renderer/utils/tools'

interface ToolSelectorProps {
  activeTool: Tool
  setActiveTool: SetActiveTool
}

export function ToolSelector({ activeTool, setActiveTool }: ToolSelectorProps) {
  return (
    <>
      <NavLink
        label="Terrain"
        icon={<Landscape />}
        onClick={() => setActiveTool(Tools.TERRAIN)}
        active={activeTool === Tools.TERRAIN}
      />
      <NavLink
        label="Objects"
        icon={<Local />}
        onClick={() => setActiveTool(Tools.OBJECTS)}
        active={activeTool === Tools.OBJECTS}
      />
    </>
  )
}
