import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
  }
}

declare module 'pixi.js' {
  interface IRenderer {
    framebuffer?: any
  }
}
