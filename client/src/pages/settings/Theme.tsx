import { Check } from 'lucide-react'
import { useState } from 'react'
import type { SettingsPageProps } from './types'

const Theme = ({ onBack }: SettingsPageProps) => {
    const [theme, setTheme] = useState(
        localStorage.getItem('theme') || 'light'
    )

    const changeTheme = (
        value: 'light' | 'dark' | 'system'
    ) => {
        setTheme(value)

        localStorage.setItem('theme', value)

        const root = document.documentElement

        if (value === 'dark') {
            root.classList.add('dark')
        } else if (value === 'light') {
            root.classList.remove('dark')
        } else {
            const prefersDark =
                window.matchMedia(
                    '(prefers-color-scheme: dark)'
                ).matches

            root.classList.toggle(
                'dark',
                prefersDark
            )
        }

        onBack()
    }

    return (
        <div className="h-full bg-white dark:bg-black">
            <div className="px-3 py-2 text-sm font-semibold text-gray-500">
                Theme
            </div>

            <button
                onClick={() =>
                    changeTheme('light')
                }
                className="w-full flex items-center justify-between px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
                <span>Light</span>

                {theme === 'light' && (
                    <Check size={18} />
                )}
            </button>

            <button
                onClick={() =>
                    changeTheme('dark')
                }
                className="w-full flex items-center justify-between px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
                <span>Dark</span>

                {theme === 'dark' && (
                    <Check size={18} />
                )}
            </button>

            <button
                onClick={() =>
                    changeTheme('system')
                }
                className="w-full flex items-center justify-between px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
                <span>System</span>

                {theme === 'system' && (
                    <Check size={18} />
                )}
            </button>
        </div>
    )
}

export default Theme