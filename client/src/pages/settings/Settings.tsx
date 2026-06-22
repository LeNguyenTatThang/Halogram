import { useState } from 'react'
import {
    Languages,
    Moon,
    Bell,
    Lock,
    ChevronRight,
    ChevronLeft
} from 'lucide-react'

import Language from './Language'
import Theme from './Theme'
import Privacy from './Privacy'
import Notification from './Notification'
import { useTranslation } from 'react-i18next'
import type { SettingsPage } from './types'

const Settings = () => {
    const { t, i18n } =
        useTranslation('settings')

    const [page, setPage] =
        useState<SettingsPage>('main')

    const pages = {
        language: (
            <Language
                onBack={() =>
                    setPage('main')
                }
            />
        ),
        theme: (
            <Theme
                onBack={() =>
                    setPage('main')
                }
            />
        ),
        privacy: (
            <Privacy
                onBack={() =>
                    setPage('main')
                }
            />
        ),
        notification: (
            <Notification
                onBack={() =>
                    setPage('main')
                }
            />
        )
    }

    if (page !== 'main') {
        return (
            <>
                <button
                    onClick={() =>
                        setPage('main')
                    }
                    className="flex items-center gap-2 p-3 hover:bg-gray-100 w-full bg-white dark:bg-black"
                >
                    <ChevronLeft size={18} />
                    <span>
                        {t('settings')}
                    </span>
                </button>

                {pages[page]}
            </>
        )
    }

    return (
        <div className="p-3 space-y-1 bg-white dark:bg-black h-full">
            <button
                onClick={() =>
                    setPage('language')
                }
                className="w-full flex justify-between px-3 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
            >
                <div className="flex items-center gap-3">
                    <Languages size={18} />
                    <span>
                        {t('language')}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <span>
                        {i18n.language ===
                        'vi'
                            ? 'Tiếng Việt'
                            : 'English'}
                    </span>
                    <ChevronRight size={16} />
                </div>
            </button>

            <button
                onClick={() =>
                    setPage('theme')
                }
                className="w-full flex justify-between px-3 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
            >
                <div className="flex items-center gap-3">
                    <Moon size={18} />
                    <span>
                        {t('theme')}
                    </span>
                </div>

                <ChevronRight size={16} />
            </button>

            <button
                onClick={() =>
                    setPage(
                        'notification'
                    )
                }
                className="w-full flex justify-between px-3 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
            >
                <div className="flex items-center gap-3">
                    <Bell size={18} />
                    <span>
                        {t(
                            'notifications'
                        )}
                    </span>
                </div>

                <ChevronRight size={16} />
            </button>

            <button
                onClick={() =>
                    setPage('privacy')
                }
                className="w-full flex justify-between px-3 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
            >
                <div className="flex items-center gap-3">
                    <Lock size={18} />
                    <span>
                        {t('privacy')}
                    </span>
                </div>

                <ChevronRight size={16} />
            </button>
        </div>
    )
}

export default Settings