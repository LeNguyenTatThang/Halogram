import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { SettingsPageProps } from './types'

const Language = ({ onBack }: SettingsPageProps) => {
    const { t, i18n } = useTranslation('settings')

    const changeLanguage = async (
        language: 'en' | 'vi'
    ) => {
        await i18n.changeLanguage(language)
        onBack()
    }

    return (
        <div className="h-full bg-white dark:bg-black">
            <div className="px-3 py-2 text-sm font-semibold text-gray-500">
                {t('language')}
            </div>

            <button
                onClick={() => changeLanguage('en')}
                className="w-full flex items-center justify-between px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
                <span>English</span>

                {i18n.language === 'en' && (
                    <Check size={18} />
                )}
            </button>

            <button
                onClick={() => changeLanguage('vi')}
                className="w-full flex items-center justify-between px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
                <span>Tiếng Việt</span>

                {i18n.language === 'vi' && (
                    <Check size={18} />
                )}
            </button>
        </div>
    )
}

export default Language