export function getModKey() {
  switch (window.api.platform) {
    case 'win32':
      return 'ctrl'
    case 'darwin':
      return 'meta'
    default:
      return 'ctrl'
  }
}
