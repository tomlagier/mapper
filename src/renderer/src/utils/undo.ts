import { useEffect, useState } from 'react'

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
  useEffect(() => {
    window.api.onUndo(undo)
    window.api.onRedo(redo)
    return () => {
      window.api.clearUndo()
      window.api.clearRedo()
    }
  }, [undoStack, redoStack])

  return {
    undo,
    redo,
    push
  }
}
