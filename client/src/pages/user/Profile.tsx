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
import HalogramLoading from '../../components/ui/HalogramLoading'
import VerifiedBadge from '../../components/common/VerifiedBadge'
import UserAvatar from '../../components/ui/UserAvatar'

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
                <HalogramLoading size="lg" text="Đang tải trang cá nhân..." />
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
        <div className="min-h-screen bg-white dark:bg-black">
            <div className="flex flex-col justify-self-end max-w-5xl px-4 py-8 md:mr-5">
                {/* Profile Header */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
                    <UserAvatar src={profile.avatar} name={profile.displayName || profile.username} size={128} className="flex-shrink-0" />
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-4 mb-2">
                            <h1 className="text-xl font-semibold truncate inline-flex items-center gap-1">{profile.username}{profile.isVerified && <VerifiedBadge />}</h1>
                            {isOwnProfile && <Settings className="w-5 h-5 cursor-pointer hover:text-gray-600 transition-colors flex-shrink-0" />}
                        </div>
                        <div className="flex justify-center sm:justify-start gap-6 text-sm mb-3">
                            <span><strong>{profile.posts}</strong> <span className="text-gray-500">{t('posts')}</span></span>
                            <span><strong>{profile.followers.toLocaleString()}</strong> <span className="text-gray-500">{t('followers')}</span></span>
                            <span><strong>{profile.following.toLocaleString()}</strong> <span className="text-gray-500">{t('following')}</span></span>
                        </div>
                        {profile.bio && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">{profile.bio}</p>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-8">
                    {isOwnProfile ? (
                        <button onClick={() => setShowEditProfile(true)}
                            className="h-9 px-6 rounded-lg bg-[#EFEFEF] hover:bg-[#DBDBDB] dark:bg-[#363636] dark:hover:bg-[#4A4A4A] text-sm font-medium transition-colors duration-150">
                            {t('editProfile')}
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleFollow}
                                disabled={followLoading}
                                className={`h-9 px-5 rounded-lg text-sm font-medium transition-colors duration-150 flex items-center gap-2 ${
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
                                className={`h-9 px-5 rounded-lg text-sm font-medium transition-colors duration-150 flex items-center gap-2 ${
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
                                className="h-9 px-5 rounded-lg bg-[#EFEFEF] hover:bg-[#DBDBDB] dark:bg-[#363636] dark:hover:bg-[#4A4A4A] text-sm font-medium transition-colors duration-150 flex items-center gap-2"
                            >
                                <MessageCircle className="w-4 h-4" /> Message
                            </button>
                        </>
                    )}
                </div>

                {/* Tabs */}
                <div className="border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-center">
                        {tabs.map((tab) => (
                            tab.id === 'saved' && !isOwnProfile ? null : (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors duration-150 ${
                                        activeTab === tab.id
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

                {/* Post Grid */}
                <div className="mt-1">
                    {postsStatus === LOADING && activeTab === 'posts' ? (
                        <div className="flex items-center justify-center py-12">
                            <HalogramLoading size="md" />
                        </div>
                    ) : displayPosts.length > 0 ? (
                        <div className="grid grid-cols-3 gap-1">
                            {displayPosts.map((post) => (
                                <div
                                    key={post.id}
                                    className="aspect-square bg-gray-100 dark:bg-gray-800 relative group overflow-hidden"
                                >
                                    {post.images?.[0] ? (
                                        <>
                                            <img
                                                src={post.images[0].url}
                                                alt={post.caption ?? 'Post'}
                                                className="w-full h-full object-cover cursor-pointer"
                                            />
                                            {isOwnProfile && activeTab === 'posts' && (
                                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setShowDeleteConfirm(post)
                                                        }}
                                                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-150 hover:scale-110"
                                                    >
                                                        <Trash2 className="w-5 h-5 text-white" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setEditingPost(post)
                                                        }}
                                                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-150 hover:scale-110"
                                                    >
                                                        <Edit3 className="w-5 h-5 text-white" />
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
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
