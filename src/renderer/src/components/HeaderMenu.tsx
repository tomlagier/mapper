import { Header, Button, Menu, Text } from '@mantine/core'
import { SetUiState } from '@renderer/hooks/useAppState'

interface HeaderMenuProps {
  undo: VoidFunction
  redo: VoidFunction
  save: VoidFunction
  saveAs: VoidFunction
  load: VoidFunction
  newDoc: VoidFunction
  setUiState: SetUiState
}

export function HeaderMenu({
  undo,
  redo,
  save,
  saveAs,
  load,
  newDoc,
  setUiState
}: HeaderMenuProps) {
  return (
    <Header height={40} p="0">
      <Menu shadow="md" width={200} position="bottom-start">
        <Menu.Target>
          <Button variant="subtle">File</Button>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item>Settings</Menu.Item>
          <Menu.Item onClick={() => newDoc()}>New</Menu.Item>
          <Menu.Item onClick={() => save()}>Save</Menu.Item>
          <Menu.Item onClick={() => saveAs()}>Save as...</Menu.Item>
          <Menu.Item onClick={() => load()}>Open</Menu.Item>
          <Menu.Item onClick={() => setUiState((s) => ({ ...s, preferencesModalShowing: true }))}>
            Preferences
          </Menu.Item>
          <Menu.Item>Export</Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <Menu shadow="md" width={200} position="bottom-start">
        <Menu.Target>
          <Button variant="subtle">Edit</Button>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item onClick={undo}>Undo</Menu.Item>
          <Menu.Item onClick={redo}>Redo</Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Header>
  )
}
