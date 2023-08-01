import { App, BrowserWindow, dialog, ipcMain } from 'electron'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { openSaveDialog } from './save'

const CONFIG_FILE_NAME = 'preferences.json'

const DEFAULT_PREFERENCES = {
  customAssetsDirectory: null,
  configured: false
}

function getConfigFilePath(app: App) {
  const userDataPath = app.getPath('userData')
  const configFilePath = path.join(userDataPath, CONFIG_FILE_NAME)
  return configFilePath
}

export async function loadUserPreferences(app: App) {
  // Try to read the file
  const configFilePath = getConfigFilePath(app)

  try {
    const file = await readFile(configFilePath, 'utf8')
    console.log(`Loaded preferences from ${configFilePath}`)
    return JSON.parse(file)
  } catch (err) {
    if (err instanceof Error && 'code' in err && err.code === 'ENOENT') {
      // File doesn't exist, create it with default preferences
      await writeFile(configFilePath, JSON.stringify(DEFAULT_PREFERENCES, null, 2), 'utf8')

      return DEFAULT_PREFERENCES
    }

    console.error(`Error loading configuration file from path ${configFilePath}`)
  }
}

export function bindUserPreferencesEvents(window: BrowserWindow, preferences, app: App) {
  const configFilePath = getConfigFilePath(app)

  ipcMain.on('selectCustomAssetsDir', async () => {
    const path = await openCustomAssetsDirectoryPicker(window)

    if (path) {
      preferences.customAssetsDirectory = path
      await writeFile(configFilePath, JSON.stringify(preferences, null, 2), 'utf8')
    }

    window.webContents.send('preferencesLoaded', JSON.stringify(preferences))
  })

  ipcMain.on('loadPreferences', async () => {
    window.webContents.send('preferencesLoaded', JSON.stringify(preferences))
  })

  // Assume frontend sends full preferences
  ipcMain.on('savePreferences', async (event, newPrefs) => {
    Object.assign(preferences, JSON.parse(newPrefs))
    // TODO: Better flag for configured
    preferences.configured = true
    await writeFile(configFilePath, JSON.stringify(preferences, null, 2), 'utf8')
  })
}

async function openCustomAssetsDirectoryPicker(window: BrowserWindow) {
  const resp = await dialog.showOpenDialog(window, {
    message: 'Choose a directory to load custom assets',
    properties: ['openDirectory', 'createDirectory']
    // TODO
    // defaultPath:
  })

  return resp.filePaths.length > 0 ? resp.filePaths[0] : null
}
