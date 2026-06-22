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

const Profile: React.FC<ProfileProps> = ({ user, posts, isOwnProfile, onFollow }) => {
    const [activeTab, setActiveTab] = useState('posts')
    const {t} = useTranslation('profile')
    const tabs = [
        { id: 'posts', icon: Grid, label: 'Posts' },
        { id: 'tagged', icon: Tag, label: 'Tagged' },
        { id: 'saved', icon: Bookmark, label: 'Saved' },
    ]

    const userPosts = posts.filter(post => post.user.id === user.id)
    console.log('User Posts:', userPosts)

    return (
        <div className="bg-white min-h-screen dark:bg-black">
            <div className="px-4 py-6">
                <div className="flex items-center space-x-6 mb-6">
                    <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-20 h-20 rounded-full object-cover"
                    />
                    <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                            <h1 className="text-xl font-semibold">{user.username}</h1>
                            {isOwnProfile ? (
                                <button className="px-4 py-1 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                                    {t('editProfile')}
                                </button>
                            ) : (
                                <button
                                    onClick={onFollow}
                                    className={`px-4 py-1 rounded text-sm font-medium ${user.isFollowing
                                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                        : 'bg-blue-500 text-white hover:bg-blue-600'
                                        }`}
                                >
                                    {user.isFollowing ? `${t('unfollow')}` : `${t('follow')}`}
                                </button>
                            )}
                            {isOwnProfile && (
                                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer">
                                    <Settings className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                        <div className="flex space-x-6 text-sm">
                            <span><strong>{user.posts}</strong> {t('posts')}</span>
                            <span><strong>{user.followers.toLocaleString()}</strong> {t('followers')}</span>
                            <span><strong>{user.following.toLocaleString()}</strong> {t('following')}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <h2 className="font-semibold">{user.email}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{user.bio}</p>
                </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-600">
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
                    // <div className="grid grid-cols-3 gap-1">
                    //     {userPosts.map((post) => (
                    //         <div key={post.id} className="aspect-square">
                    //             <img
                    //                 src={post.image}
                    //                 alt="Post"
                    //                 className="w-full h-full object-cover cursor-pointer hover:opacity-80"
                    //             />
                    //         </div>
                    //     ))}
                    // </div>
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">No tagged posts yet</p>
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