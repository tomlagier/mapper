import { ElectronAPI } from '@electron-toolkit/preload'
import { UserPreferences } from '@renderer/types/state'
import { Event } from 'electron'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      onUndo: (cb: VoidFunction) => void
      onRedo: (cb: VoidFunction) => void
      clearUndo: VoidFunction
      clearRedo: VoidFunction
      platform: 'win32' | 'darwin'

      save: (file: string, path: string) => void
      saveAs: (file: string) => void

      onSaveLocationSet: (cb: (e: Event, path: string) => void) => void
      onSaveComplete: (cb: VoidFunction) => void

      load: VoidFunction
      onLoad: (cb: (e: Event, file: string) => void) => void

      newDoc: VoidFunction
      onNewDoc: (cb: (e: Event, path: string) => void) => void

      loadUserPreferences: VoidFunction
      saveUserPreferences: (preferences: string) => void
      onPreferencesLoaded: (cb: (e: Event, preferences: string) => void) => void

      clearSaveHandlers: VoidFunction

      selectCustomAssetsDirectory: VoidFunction
    }
  }
}

declare module 'pixi.js' {
  interface IRenderer {
    framebuffer?: any
  }
}
