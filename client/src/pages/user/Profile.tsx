import React, { useState } from 'react'
import type { User } from '../../types/User'
import type { Post } from '../../types/Post'
import { Settings, Grid, Tag, Bookmark } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ProfileProps {
    user: User
    posts: Post[]
    isOwnProfile: boolean
    onFollow?: () => void
}

const Profile: React.FC<ProfileProps> = ({ user, posts, isOwnProfile }) => {
    const [activeTab, setActiveTab] = useState('posts')
    const {t} = useTranslation('profile')
    const tabs = [
        { id: 'posts', icon: Grid, label: 'Posts' },
        { id: 'tagged', icon: Tag, label: 'Tagged' },
        { id: 'saved', icon: Bookmark, label: 'Saved' },
    ]

    const userPosts = posts.filter(post => post.user.id === user.id)

    return (
        <div className="px-18 mx-auto bg-white min-h-screen dark:bg-black">
            <div className="max-w-2xl mx-auto py-6">
                <div className="flex items-center space-x-6 mb-6">
                    <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-48 h-48 rounded-full object-cover"
                    />
                    <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                            <h1 className="text-xl font-semibold">{user.username}</h1>
                            <Settings className="w-5 h-5 cursor-pointer" />
                        </div>
                        <div className="flex space-x-6 text-sm">
                            <span><strong>{user.posts}</strong> {t('posts')}</span>
                            <span><strong>{user.followers.toLocaleString()}</strong> {t('followers')}</span>
                            <span><strong>{user.following.toLocaleString()}</strong> {t('following')}</span>
                        </div>
                        <div className="flex space-x-6 mt-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">{user.bio}</p>
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-2 sm:justify-center">
                    <button className="h-10 w-full sm:w-auto sm:px-8 md:px-16 rounded-md bg-[#EFEFEF] hover:bg-[#DBDBDB] dark:bg-[#363636] dark:hover:bg-[#4A4A4A] text-sm font-semibold transition">
                        Chỉnh sửa trang cá nhân
                    </button>

                    <button className="h-10 w-full sm:w-auto sm:px-8 md:px-16 rounded-md bg-[#EFEFEF] hover:bg-[#DBDBDB] dark:bg-[#363636] dark:hover:bg-[#4A4A4A] text-sm font-semibold transition">
                        Xem kho lưu trữ
                    </button>
                </div>
            </div>

            <div className="max-w-[950px] mx-auto border-t border-gray-200 dark:border-gray-600">
                <div className="flex justify-center">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-medium ${activeTab === tab.id
                                ? 'text-black border-t-2 border-black dark:text-white dark:border-white'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-1">
                {activeTab === 'posts' && (
                    <div className="grid grid-cols-3 gap-1">
                        {userPosts.length > 0 ? (
                            userPosts.map((post) => (
                                <div
                                    key={post.id}
                                    className="aspect-square bg-gray-100 dark:bg-gray-800"
                                >
                                    {post.images?.[0] ? (
                                        <img
                                            src={post.images[0].url}
                                            alt={post.caption ?? 'Post'}
                                            className="w-full h-full object-cover cursor-pointer hover:opacity-80"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            No image
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-12">
                                <p className="text-gray-500 dark:text-gray-400">
                                    No posts yet
                                </p>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'tagged' && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">No tagged posts yet</p>
                    </div>
                )}
                {activeTab === 'saved' && isOwnProfile && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">No saved posts yet</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Profile