export function getModKey() {
  switch (window.api.platform) {
    case 'win32':
      return 'ctrl'
    case 'darwin':
      return 'cmd'
    default:
      return 'ctrl'
  }
}
