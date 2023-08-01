import {
  Button,
  Dialog,
  Modal,
  Select,
  TextInput,
  Title,
  Box,
  Flex,
  SegmentedControl
} from '@mantine/core'
import { SetUiState, SetUserPreferences } from '@renderer/hooks/useAppState'
import { UserPreferences } from '@renderer/types/state'
import { useForm } from '@mantine/form'
import { useEffect } from 'react'

interface PreferencesModalProps {
  userPreferences: UserPreferences
  setUserPreferences: SetUserPreferences
  saveUserPreferences: (preferences: UserPreferences) => void
  opened: boolean
  onClose: VoidFunction
}

export function PreferencesModal({
  opened,
  onClose,
  userPreferences,
  setUserPreferences,
  saveUserPreferences
}: PreferencesModalProps) {
  const form = useForm({
    initialValues: {
      // customAssetsDirectory: userPreferences.customAssetsDirectory || 'Not set'
    }
  })

  const onSubmit = form.onSubmit(() => {
    saveUserPreferences(userPreferences)
    onClose()
  })

  useEffect(() => {
    window.api.loadUserPreferences()
  }, [])

  return (
    <Modal opened={opened} onClose={onClose} centered>
      <form onSubmit={onSubmit}>
        <Title>Preferences</Title>
        <Flex align="flex-end" mb={16}>
          <TextInput
            label="Custom assets directory"
            disabled
            value={userPreferences.customAssetsDirectory || 'Not set'}
            sx={{ flexGrow: 1 }}
          />
          <Button onClick={() => window.api.selectCustomAssetsDirectory()}>Choose</Button>
        </Flex>
        <Button type="submit">Save preferences</Button>
      </form>
    </Modal>
  )
}
