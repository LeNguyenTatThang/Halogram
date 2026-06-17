import { useState } from 'react'
import {
    Home,
    Search as SearchIcon,
    PlusSquare,
    Heart,
    User
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Logo from '../assets/logo.png'
import { useAuth } from '../hooks/useAuth'
import Search from '../pages/search/Search'
import CreatePost from '../pages/post/CreatePost'
import Notifications from '../pages/notifications/Notifications'

const navItems = [
    {
        id: 'home',
        icon: Home,
        href: '/',
        type: 'link'
    },
    {
        id: 'search',
        icon: SearchIcon,
        type: 'tab'
    },
    {
        id: 'create',
        icon: PlusSquare,
        type: 'tab'
    },
    {
        id: 'notifications',
        icon: Heart,
        type: 'tab'
    },
    {
        id: 'profile',
        icon: User,
        href: '/profile',
        type: 'link'
    }
] as const

interface NavigationProps {
    locale?: string
}

const Navigation: React.FC<NavigationProps> = () => {
    const { logout } = useAuth()

    const [activeTab, setActiveTab] = useState('')

    const { t } = useTranslation('navigation')

    const openTab = (id: string) => {
        setActiveTab(prev => (prev === id ? '' : id))
    }

    const handleLogout = () => {
        logout()
        setActiveTab('')
    }

    return (
        <nav>
            {/* Desktop Sidebar */}
            <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-64 md:bg-white md:border-r md:border-gray-200 z-40 shadow-lg">
                <div className="flex items-center justify-between px-4 py-4 border-b">
                    <div className="flex items-center">
                        <img
                            src={Logo}
                            alt="Logo"
                            className="w-8 h-8 mr-3"
                        />

                        <span
                            style={{
                                fontFamily: "'Monoton', cursive",
                                fontSize: '1.5rem'
                            }}
                        >
                            HALOGRAM
                        </span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-2">
                    {navItems.map(item => {
                        const Icon = item.icon

                        const content = (
                            <div
                                className="flex items-center justify-between mb-3 cursor-pointer hover:bg-gray-100 px-2 py-2 rounded"
                                onClick={
                                    item.type === 'tab'
                                        ? () => openTab(item.id)
                                        : undefined
                                }
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className="w-6 h-6" />
                                    <span className="text-sm font-medium">
                                        {t(item.id)}
                                    </span>
                                </div>
                            </div>
                        )

                        if (item.type === 'link') {
                            return (
                                <Link
                                    key={item.id}
                                    to={item.href}
                                >
                                    {content}
                                </Link>
                            )
                        }

                        return (
                            <div key={item.id}>
                                {content}
                            </div>
                        )
                    })}

                    <div
                        className="flex items-center justify-between mb-3 cursor-pointer hover:bg-gray-100 px-2 py-2 rounded text-red-600"
                        onClick={handleLogout}
                    >
                        <div className="flex items-center gap-3">
                            <User className="w-6 h-6" />
                            <span className="text-sm font-medium">
                                {t('logout')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Panel */}
            {['search', 'create', 'notifications'].includes(activeTab) && (
                <div className="hidden md:block fixed left-64 w-80 h-full z-50 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-4 py-2 border-b">
                        <span className="font-semibold text-sm capitalize">
                            {activeTab}
                        </span>

                        <button
                            onClick={() => setActiveTab('')}
                            className="text-gray-500 hover:text-red-500 text-lg"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="flex-1 px-4 py-2 overflow-y-auto bg-gray-50">
                        {activeTab === 'search' && (
                            <Search
                            />
                        )}

                        {activeTab === 'create' && (
                            <CreatePost
                                onClose={() => setActiveTab('')}
                                onPost={() => {
                                    setActiveTab('')
                                }}
                            />
                        )}

                        {activeTab === 'notifications' && (
                            <Notifications />
                        )}
                    </div>
                </div>
            )}

            {/* Mobile Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
                <div className="flex justify-around items-center py-2">
                    {navItems.map(item => {
                        const Icon = item.icon

                        return (
                            <button
                                key={item.id}
                                onClick={() => openTab(item.id)}
                                className={`flex flex-col items-center p-2 transition-colors ${
                                    activeTab === item.id
                                        ? 'text-black'
                                        : 'text-gray-500'
                                }`}
                            >
                                <Icon className="w-6 h-6" />
                            </button>
                        )
                    })}
                </div>
            </div>
        </nav>
    )
}

export default Navigation