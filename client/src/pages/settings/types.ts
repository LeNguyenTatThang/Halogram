export type SettingsPage =
    | 'main'
    | 'language'
    | 'theme'
    | 'privacy'
    | 'notification'

export interface SettingsPageProps {
    onBack: () => void
}