import { useCallback, useEffect, useState } from 'react'

export interface UndoCommand {
  undo(): void
  redo(): void
}

export function useUndo() {
  const [undoStack, setUndoStack] = useState<UndoCommand[]>([])
  const [redoStack, setRedoStack] = useState<UndoCommand[]>([])

  function undo() {
    console.log('undo start')
    const command = undoStack.pop()
    if (command) {
      command.undo()
      setRedoStack((stack) => [...stack, command])
    }
    console.log('undo end')
  }

  function redo() {
    console.log('redo start')
    const command = redoStack.pop()
    if (command) {
      command.redo()
      setUndoStack((stack) => [...stack, command])
    }
    console.log('redo end')
  }

  function push(command: UndoCommand) {
    setUndoStack((stack) => [...stack, command])
    setRedoStack((s) => [])
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'KeyZ' && e.metaKey) {
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [undoStack, redoStack])

  return {
    undo,
    redo,
    push
  }
}
