import { BrowserWindow, dialog, ipcMain } from 'electron'
import { existsSync } from 'fs'
import { writeFile, readFile } from 'node:fs/promises'

export async function openSaveDialog(window: BrowserWindow) {
  const { filePath } = await dialog.showSaveDialog(window, {
    message: 'Where would you like to save?',
    properties: ['createDirectory'],
    filters: [{ name: 'Mapper file', extensions: ['mapper'] }]
    // TODO
    // defaultPath:
  })

  return filePath
}

export async function openLoadDialog(window: BrowserWindow) {
  const { filePaths } = await dialog.showOpenDialog(window, {
    message: 'What would you like to open?',
    filters: [{ name: 'Mapper file', extensions: ['mapper'] }]
    // TODO
    // defaultPath:
  })

  return filePaths.length > 0 ? filePaths[0] : undefined
}

export async function saveFile(fileContents: Buffer, path: string, window: BrowserWindow) {
  // TODO: Error handling, maybe preprocessing?
  await writeFile(path, fileContents, 'utf8')
  window.webContents.send('saveComplete')
}

export function bindSaveEvents(window: BrowserWindow) {
  ipcMain.on('save', async (event, file, path) => {
    if (path) {
      await saveFile(file, path, window)
    }
  })

  ipcMain.on('saveAs', async (event, file) => {
    const path = await openSaveDialog(window)
    window.webContents.send('saveLocationSet', path)

    if (path) {
      await saveFile(file, path, window)
    }
  })

  ipcMain.on('load', async () => {
    const fileToLoad = await openLoadDialog(window)

    if (!fileToLoad) return

    window.webContents.send('saveLocationSet', fileToLoad)
    const fileContents = await readFile(fileToLoad, 'utf8')
    window.webContents.send('loaded', fileContents)
  })
}
