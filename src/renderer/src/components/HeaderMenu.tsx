import { Header, Button, Menu, Text } from '@mantine/core'

interface HeaderMenuProps {
  undo: VoidFunction
  redo: VoidFunction
  save: VoidFunction
  saveAs: VoidFunction
  load: VoidFunction
}

export function HeaderMenu({ undo, redo, save, saveAs, load }: HeaderMenuProps) {
  return (
    <Header height={40} p="0">
      <Menu shadow="md" width={200} position="bottom-start">
        <Menu.Target>
          <Button variant="subtle">File</Button>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item>Settings</Menu.Item>
          <Menu.Item onClick={() => save()}>Save</Menu.Item>
          <Menu.Item onClick={() => saveAs()}>Save as...</Menu.Item>
          <Menu.Item onClick={() => load()}>Open</Menu.Item>
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
