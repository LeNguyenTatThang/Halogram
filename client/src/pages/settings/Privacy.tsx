import type { SettingsPageProps } from './types'
const Privacy = ({ onBack }: SettingsPageProps) => {
    console.log(onBack)
    return (
        <div className="h-full bg-white dark:bg-black">
            <div className="px-3 py-2 text-sm font-semibold text-gray-500">
                Privacy
            </div>

            <button className="w-full text-left px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-800">
                Public
            </button>

            <button className="w-full text-left px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-800">
                Friends Only
            </button>

            <button className="w-full text-left px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-800">
                Private
            </button>
        </div>
    )
}

export default Privacy