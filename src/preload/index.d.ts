import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      onUndo: (cb: VoidFunction) => void
      onRedo: (cb: VoidFunction) => void
      clearUndo: () => void
      clearRedo: () => void
    }
  }
}

declare module 'pixi.js' {
  interface IRenderer {
    framebuffer?: any
  }
}
