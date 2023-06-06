import { Landscape, Local } from '@icon-park/react'
import { NavLink } from '@mantine/core'
import { SetActiveTool } from '@renderer/hooks/useAppState'
import { TOOL, TOOLS } from '@renderer/utils/tools'

interface ToolSelectorProps {
  activeTool: TOOL
  setActiveTool: SetActiveTool
}

export function ToolSelector({ activeTool, setActiveTool }: ToolSelectorProps) {
  return (
    <>
      <NavLink
        label="Terrain"
        icon={<Landscape />}
        onClick={() => setActiveTool(TOOLS.TERRAIN)}
        active={activeTool === TOOLS.TERRAIN}
      />
      <NavLink
        label="Objects"
        icon={<Local />}
        onClick={() => setActiveTool(TOOLS.OBJECTS)}
        active={activeTool === TOOLS.OBJECTS}
      />
    </>
  )
}
