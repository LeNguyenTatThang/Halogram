import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import type { User } from '../../types/User'
import type { Post } from '../../types/Post'
import { Settings, Grid, Tag, Bookmark, Edit3, Trash2, UserPlus, UserCheck, MessageCircle, Clock3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import { getProfile } from '../../utils/profile'
import { getUserPosts, getSavedPosts, getTaggedPosts, deletePost } from '../../utils/post'
import { followUser, unfollowUser } from '../../utils/follow'
import { addFriend, cancelFriend, removeFriend } from '../../utils/friend'
import { createConversation } from '../../utils/messages'
import EditProfileModal from '../../components/profile/EditProfileModal'
import EditPostModal from '../../components/profile/EditPostModal'

const LOADING = 'loading'
const ERROR = 'error'
const SUCCESS = 'success'

const Profile: React.FC = () => {
    const { username: paramUsername } = useParams<{ username: string }>()
    const navigate = useNavigate()
    const { t } = useTranslation('profile')
    const { t: postT } = useTranslation()
    const { user: currentUser } = useAuth()
    const [activeTab, setActiveTab] = useState('posts')
    const [profile, setProfile] = useState<(User & { isFollowing: boolean; isFriend: boolean; friendshipStatus: 'NONE' | 'PENDING' | 'FRIENDS'; hasPendingFriendRequest: boolean }) | null>(null)
    const [userPosts, setUserPosts] = useState<Post[]>([])
    const [savedPosts, setSavedPosts] = useState<Post[]>([])
    const [taggedPosts, setTaggedPosts] = useState<Post[]>([])
    const [profileStatus, setProfileStatus] = useState(LOADING)
    const [postsStatus, setPostsStatus] = useState(LOADING)
    const [showEditProfile, setShowEditProfile] = useState(false)
    const [editingPost, setEditingPost] = useState<Post | null>(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<Post | null>(null)
    const [deletingPost, setDeletingPost] = useState(false)
    const [followLoading, setFollowLoading] = useState(false)
    const [friendLoading, setFriendLoading] = useState(false)

    const username = paramUsername || 'me'
    const isOwnProfile = username === 'me' || (currentUser && profile?.username === currentUser.username)

    const tabs = [
        { id: 'posts', icon: Grid, label: t('posts') },
        { id: 'tagged', icon: Tag, label: t('tagged') },
        { id: 'saved', icon: Bookmark, label: t('saved') },
    ]

    useEffect(() => {
        let cancelled = false
        const load = async () => {
            setProfileStatus(LOADING)
            setPostsStatus(LOADING)

            try {
                const profileRes = await getProfile(username)
                if (cancelled) return
                setProfile(profileRes)
                setProfileStatus(SUCCESS)

                const [postsRes, taggedRes] = await Promise.all([
                    getUserPosts(profileRes.id),
                    getTaggedPosts(profileRes.id),
                ])
                if (cancelled) return
                setUserPosts(postsRes.posts ?? [])
                setTaggedPosts(taggedRes.posts ?? [])
                setPostsStatus(SUCCESS)
            } catch {
                if (!cancelled) setProfileStatus(ERROR)
            }
        }
        load()
        return () => { cancelled = true }
    }, [username])

    useEffect(() => {
        if (activeTab !== 'saved' || savedPosts.length > 0) return
        let cancelled = false
        const load = async () => {
            try {
                const res = await getSavedPosts()
                if (cancelled) return
                setSavedPosts(res.posts ?? [])
            } catch { console.error('Failed to load saved posts') }
        }
        load()
        return () => { cancelled = true }
    }, [activeTab, savedPosts.length])

    const handleFollow = async () => {
        if (!profile) return
        setFollowLoading(true)
        try {
            if (profile.isFollowing) {
                await unfollowUser(profile.id)
                setProfile({ ...profile, isFollowing: false, followers: Math.max(0, profile.followers - 1) })
            } else {
                await followUser(profile.id)
                setProfile({ ...profile, isFollowing: true, followers: profile.followers + 1 })
            }
        } catch { /* ignore */ } finally { setFollowLoading(false) }
    }

    const handleFriendAction = async () => {
        if (!profile) return
        setFriendLoading(true)
        try {
            if (profile.friendshipStatus === 'NONE') {
                await addFriend(profile.id)
                setProfile({ ...profile, friendshipStatus: 'PENDING', hasPendingFriendRequest: false })
            } else if (profile.friendshipStatus === 'PENDING') {
                if (profile.hasPendingFriendRequest) {
                    await cancelFriend(profile.id)
                    setProfile({ ...profile, friendshipStatus: 'NONE', hasPendingFriendRequest: false })
                }
            } else if (profile.friendshipStatus === 'FRIENDS') {
                await removeFriend(profile.id)
                setProfile({ ...profile, friendshipStatus: 'NONE', isFriend: false })
            }
        } catch { /* ignore */ } finally { setFriendLoading(false) }
    }

    const handleMessage = async () => {
        if (!profile) return
        try {
            await createConversation(profile.id)
            navigate('/')
        } catch { /* ignore */ }
    }

    const handleDeletePost = async () => {
        if (!showDeleteConfirm || deletingPost) return
        setDeletingPost(true)
        try {
            await deletePost(showDeleteConfirm.id)
            setUserPosts((prev) => prev.filter((p) => p.id !== showDeleteConfirm.id))
            setShowDeleteConfirm(null)
            toast.success(postT('post.delete_success'))
        } catch {
            toast.error(postT('post.delete') + ' failed')
        } finally {
            setDeletingPost(false)
        }
    }

    if (profileStatus === LOADING) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
            </div>
        )
    }

    if (profileStatus === ERROR || !profile) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">User not found</p>
            </div>
        )
    }

    const displayPosts = activeTab === 'posts' ? userPosts
        : activeTab === 'saved' ? savedPosts
            : taggedPosts

    return (
        <div className="px-18 mx-auto bg-white min-h-screen dark:bg-black">
            <div className="max-w-2xl mx-auto py-6">
                <div className="flex items-center space-x-6 mb-6">
                    <img
                        src={profile.avatar}
                        alt={profile.username}
                        className="w-48 h-48 rounded-full object-cover"
                    />
                    <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                            <h1 className="text-xl font-semibold">{profile.username}</h1>
                            {isOwnProfile && <Settings className="w-5 h-5 cursor-pointer" />}
                        </div>
                        <div className="flex space-x-6 text-sm">
                            <span><strong>{profile.posts}</strong> {t('posts')}</span>
                            <span><strong>{profile.followers.toLocaleString()}</strong> {t('followers')}</span>
                            <span><strong>{profile.following.toLocaleString()}</strong> {t('following')}</span>
                        </div>
                        <div className="mt-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">{profile.bio}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-2 sm:justify-center">
                    {isOwnProfile ? (
                        <button onClick={() => setShowEditProfile(true)}
                            className="h-10 w-full sm:w-auto sm:px-8 md:px-16 rounded-md bg-[#EFEFEF] hover:bg-[#DBDBDB] dark:bg-[#363636] dark:hover:bg-[#4A4A4A] text-sm font-semibold transition">
                            {t('editProfile')}
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleFollow}
                                disabled={followLoading}
                                className={`h-10 px-6 rounded-md text-sm font-semibold transition flex items-center gap-2 justify-center ${
                                    profile.isFollowing
                                        ? 'bg-[#EFEFEF] hover:bg-[#DBDBDB] dark:bg-[#363636] dark:hover:bg-[#4A4A4A]'
                                        : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                            >
                                {followLoading ? '...' : profile.isFollowing ? <><UserCheck className="w-4 h-4" /> Following</> : <><UserPlus className="w-4 h-4" /> Follow</>}
                            </button>

                            <button
                                onClick={handleFriendAction}
                                disabled={friendLoading}
                                className={`h-10 px-6 rounded-md text-sm font-semibold transition flex items-center gap-2 justify-center ${
                                    profile.friendshipStatus === 'FRIENDS'
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                        : profile.friendshipStatus === 'PENDING'
                                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                            : 'bg-[#EFEFEF] hover:bg-[#DBDBDB] dark:bg-[#363636] dark:hover:bg-[#4A4A4A]'
                                }`}
                            >
                                {friendLoading ? '...' : profile.friendshipStatus === 'FRIENDS' ? <><UserCheck className="w-4 h-4" /> Friends</> : profile.friendshipStatus === 'PENDING' ? <><Clock3 className="w-4 h-4" /> Requested</> : <><UserPlus className="w-4 h-4" /> Add Friend</>}
                            </button>

                            <button
                                onClick={handleMessage}
                                className="h-10 px-6 rounded-md bg-[#EFEFEF] hover:bg-[#DBDBDB] dark:bg-[#363636] dark:hover:bg-[#4A4A4A] text-sm font-semibold transition flex items-center gap-2 justify-center"
                            >
                                <MessageCircle className="w-4 h-4" /> Message
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="max-w-[950px] mx-auto border-t border-gray-200 dark:border-gray-600">
                <div className="flex justify-center">
                    {tabs.map((tab) => (
                        tab.id === 'saved' && !isOwnProfile ? null : (
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
                        )
                    ))}
                </div>
            </div>

            <div className="p-1">
                {postsStatus === LOADING && activeTab === 'posts' ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
                    </div>
                ) : displayPosts.length > 0 ? (
                    <div className="grid grid-cols-3 gap-1">
                        {displayPosts.map((post) => (
                            <div
                                key={post.id}
                                className="aspect-square bg-gray-100 dark:bg-gray-800 relative group"
                            >
                                {post.images?.[0] ? (
                                    <>
                                        <img
                                            src={post.images[0].url}
                                            alt={post.caption ?? 'Post'}
                                            className="w-full h-full object-cover cursor-pointer hover:opacity-80"
                                        />
                                        {isOwnProfile && activeTab === 'posts' && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setShowDeleteConfirm(post)
                                                        }}
                                                        className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition"
                                                    >
                                                        <Trash2 className="w-5 h-5 text-white" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setEditingPost(post)
                                                        }}
                                                        className="p-2 bg-blue-600 rounded-full hover:bg-blue-700 transition"
                                                    >
                                                        <Edit3 className="w-5 h-5 text-white" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        No image
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">
                            No {activeTab === 'saved' ? 'saved' : activeTab === 'tagged' ? 'tagged' : ''} posts yet
                        </p>
                    </div>
                )}
            </div>

            {showEditProfile && profile && (
                <EditProfileModal
                    user={profile}
                    onClose={() => setShowEditProfile(false)}
                    onSaved={(updated) => setProfile({ ...profile, ...updated })}
                />
            )}

            {editingPost && (
                <EditPostModal
                    post={editingPost}
                    onClose={() => setEditingPost(null)}
                    onSaved={(updated) => {
                        setUserPosts((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)))
                        setEditingPost(null)
                    }}
                />
            )}

            {showDeleteConfirm && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
                    onClick={() => !deletingPost && setShowDeleteConfirm(null)}
                >
                    <div
                        className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-sm mx-4 p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold dark:text-white mb-4">
                            {postT('post.delete_confirm')}
                        </h3>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                disabled={deletingPost}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700 transition disabled:opacity-50"
                            >
                                {postT('post.cancel')}
                            </button>
                            <button
                                onClick={handleDeletePost}
                                disabled={deletingPost}
                                className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition flex items-center gap-2"
                            >
                                {deletingPost ? postT('post.delete_loading') : postT('post.delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Profile
