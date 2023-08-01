import { SetUiState, SetUserPreferences } from '@renderer/hooks/useAppState'
import { UiState, UserPreferences } from '@renderer/types/state'
import { PreferencesModal } from './PreferencesModal'

interface ModalsProps {
  uiState: UiState
  userPreferences: UserPreferences
  setUiState: SetUiState
  setUserPreferences: SetUserPreferences
  saveUserPreferences: (preferences: UserPreferences) => void
}

export function Modals({
  uiState,
  setUiState,
  userPreferences,
  setUserPreferences,
  saveUserPreferences
}: ModalsProps) {
  return (
    <>
      <PreferencesModal
        userPreferences={userPreferences}
        setUserPreferences={setUserPreferences}
        saveUserPreferences={saveUserPreferences}
        opened={uiState.preferencesModalShowing}
        onClose={() => setUiState((s) => ({ ...s, preferencesModalShowing: false }))}
      />
    </>
  )
}
