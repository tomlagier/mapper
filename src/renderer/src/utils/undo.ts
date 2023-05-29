import { useEffect, useState } from 'react'
import { getModKey } from './modkey'
import { useHotkeys } from 'react-hotkeys-hook'

export interface UndoCommand {
  undo(): void
  redo(): void
}

export function useUndo() {
  const [undoStack, setUndoStack] = useState<UndoCommand[]>([])
  const [redoStack, setRedoStack] = useState<UndoCommand[]>([])

  function undo() {
    const command = undoStack.pop()
    if (command) {
      command.undo()
      setRedoStack((stack) => [...stack, command])
    }
  }

  function redo() {
    const command = redoStack.pop()
    if (command) {
      command.redo()
      setUndoStack((stack) => [...stack, command])
    }
  }

  function push(command: UndoCommand) {
    setUndoStack((stack) => [...stack, command])
    setRedoStack((s) => [])
  }

  // Wire up undo stack state to IPC functions via menu
  // TODO: Move keybind handling to a single place
  useHotkeys(`${getModKey()}+z`, () => undo(), [undoStack, redoStack])
  useHotkeys(`${getModKey()}+shift+z`, () => redo(), [undoStack, redoStack])

  return {
    undo,
    redo,
    push
  }
}
