import { useCallback, useEffect, useState } from 'react'

type PermissionState = 'granted' | 'denied' | 'default' | 'unsupported'

const Notification = () => {
    const [permission, setPermission] = useState<PermissionState>(() =>
        'Notification' in window
            ? (window.Notification).permission as PermissionState
            : 'unsupported'
    )

    useEffect(() => {
        if (!('Notification' in window)) return
        const handler = () => setPermission((window.Notification).permission as PermissionState)
        document.addEventListener('visibilitychange', handler)
        return () => document.removeEventListener('visibilitychange', handler)
    }, [])

    const handleRequest = useCallback(async () => {
        if (!('Notification' in window)) return
        const result = await (window.Notification).requestPermission()
        setPermission(result as PermissionState)
    }, [])

    return (
        <div className="h-full bg-white dark:bg-black">
            <div className="px-3 py-2 text-sm font-semibold text-gray-500">
                Notifications
            </div>

            {permission === 'unsupported' && (
                <div className="px-3 py-3 text-sm text-gray-500">
                    Trình duyệt không hỗ trợ notifications.
                </div>
            )}

            {permission === 'denied' && (
                <div className="px-3 py-3 text-sm text-red-500">
                    Notifications đã bị chặn. Vào Chrome Settings &gt; Privacy & Security &gt; Site Settings &gt; Notifications để bật lại.
                </div>
            )}

            {permission === 'granted' && (
                <div className="px-3 py-3 text-sm text-green-600">
                    Notifications đã được bật.
                </div>
            )}

            {permission === 'default' && (
                <button
                    onClick={handleRequest}
                    className="w-full flex justify-between px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    <span>Enable Notifications</span>
                    <span className="text-blue-500">Bật</span>
                </button>
            )}
        </div>
    )
}

export default Notification