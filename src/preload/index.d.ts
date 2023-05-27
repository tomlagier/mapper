import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      onUndo: (cb: VoidFunction) => void
      onRedo: (cb: VoidFunction) => void
      clearUndo: () => void
      clearRedo: () => void
      platform: 'win32' | 'darwin'
    }
  }
}

declare module 'pixi.js' {
  interface IRenderer {
    framebuffer?: any
  }
}
