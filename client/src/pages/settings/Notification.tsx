import { useState } from 'react'
import type { SettingsPageProps } from './types'

const Notification = ({ onBack }: SettingsPageProps) => {
    console.log(onBack)
    const [enabled, setEnabled] =
        useState(true)

    return (
        <div className="h-full bg-white dark:bg-black">
            <div className="px-3 py-2 text-sm font-semibold text-gray-500">
                Notifications
            </div>

            <button
                onClick={() =>
                    setEnabled(!enabled)
                }
                className="w-full flex justify-between px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
                <span>
                    Enable Notifications
                </span>

                <span>
                    {enabled
                        ? 'ON'
                        : 'OFF'}
                </span>
            </button>
        </div>
    )
}

export default Notification