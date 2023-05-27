export function getModKey() {
  switch (window.api.platform) {
    case 'win32':
      return 'ctrlKey'
    case 'darwin':
      return 'metaKey'
    default:
      return 'ctrlKey'
  }
}
