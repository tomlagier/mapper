import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // Undo
  onUndo: (cb) => ipcRenderer.on('undo', cb),
  onRedo: (cb) => ipcRenderer.on('redo', cb),
  clearUndo: () => ipcRenderer.removeAllListeners('undo'),
  clearRedo: () => ipcRenderer.removeAllListeners('redo'),

  // Save/load
  save: (file, path) => ipcRenderer.send('save', file, path),
  saveAs: (file) => ipcRenderer.send('saveAs', file),
  onSaveLocationSet: (cb) => ipcRenderer.on('saveLocationSet', cb),
  onSaveComplete: (cb) => ipcRenderer.on('saveComplete', cb),
  load: () => ipcRenderer.send('load'),
  onLoad: (cb) => ipcRenderer.on('loaded', cb),
  newDoc: () => ipcRenderer.send('newDoc'),
  onNewDoc: (cb) => ipcRenderer.on('newDocCreated', cb),

  clearSaveHandlers: () => {
    ipcRenderer.removeAllListeners('saveLocationSet')
    ipcRenderer.removeAllListeners('saveComplete')
    ipcRenderer.removeAllListeners('loaded')
    ipcRenderer.removeAllListeners('newDocCreated')
  },

  // Static vars
  platform: process.platform
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
