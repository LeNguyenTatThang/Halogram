import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import AuthPage from './pages/auth/AuthPage'
import Feed from './pages/post/Feed'
import Profile from './pages/user/Profile'
import Search from './pages/search/Search'
import CreatePost from './pages/post/CreatePost'
import Notifications from './pages/notifications/Notifications'
import MainLayout from './layouts/MainLayout'
import { useAuth } from './hooks/useAuth'
import { currentUser, mockPosts, mockStories } from './store/mockData'
import { getAllPost, deletePost, removeMyTag } from './utils/post'
import type { Post } from './types/Post'
import NotFound from './pages/not-found/NotFound'
import { likePost } from './utils/like'
import { playSound } from './utils/sound'
import { createComment } from './utils/comment'
import StoryViewer from './components/common/StoryViewer'
import type { Story } from './types/Story'
import { socket } from './lib/socket'
import IncomingCallModal from './components/call/IncomingCallModal'
import { useCall } from './context/useCall'
import VideoCall from './layouts/online/VideoCall'

function App() {
    const { t } = useTranslation()
    const { isAuthenticated, loading, user } = useAuth()
    const { inCall, calling, activeCall, endCall } = useCall()
    const [posts, setPosts] = useState<Post[]>([])
    const [nextCursor, setNextCursor] = useState<string | undefined>()
    const [loadingMore, setLoadingMore] = useState(false)
    const [loadingPosts, setLoadingPosts] = useState(true)
    const [selectedStory, setSelectedStory] = useState<Story | null>(null)

    const handleLike = async (postId: string) => {
        playSound("like")
        setPosts(prev => 
            prev.map(post => {
                if(post.id !== postId) return post

                const count = post._count ?? {
                    likes: 0,
                    comments: 0
                }

                return {
                    ...post,
                    isLiked: !post.isLiked,
                    _count: {
                        ...count,
                        likes: count.likes + (post.isLiked ? -1 : 1),
                        comments: count.comments
                    }
                }
            })
        )

        try {
            const res = await likePost(postId)

            setPosts(prev => 
                prev.map(post => {
                    if(post.id !== postId) return post

                    const count = post._count ?? {
                        likes: 0,
                        comments: 0
                    }

                    return {
                        ...post,
                        isLiked: res.liked,
                        _count: {
                            ...count,
                            likes: res.count,
                            comments: count.comments
                        }
                    }
                })
            )
        } catch (err) {
            setPosts(prev => 
                prev.map(post => {
                    if(post.id !== postId) return post

                    const count = post._count ?? {
                        likes: 0,
                        comments: 0
                    }

                    return {
                        ...post,
                        isLiked: !post.isLiked,
                        _count: {
                            ...count,
                            likes: count.likes + (post.isLiked ? -1 : 1),
                            comments: count.comments
                        }
                    }
                })
            )
            console.log(err)
        }
    }

    const handleComment = async (postId: string, comment: string) => {
        try {
            const res = await createComment(postId, comment)
            if(!res.success) return

            setPosts(prev =>
                prev.map(post => {
                    if (post.id !== postId) return post

                    const comments = [res.data, ...(post.comments ?? [])].slice(0, 2)
                    const count = post._count ?? {
                        likes: 0,
                        comments: 0
                    }

                    return {
                        ...post,
                        comments,
                        _count: {
                            ...count,
                            likes: count.likes,
                            comments: count.comments + 1,
                        },
                    }
                })
            )
        } catch (err) {
            console.log(err)
        }
    } 
    const handleDeletePost = async (postId: string) => {
        try {
            await deletePost(postId)
            setPosts((prev) => prev.filter((p) => p.id !== postId))
            toast.success(t('post.delete_success'))
        } catch (err) {
            toast.error(t('post.delete') + ' failed')
            console.log(err)
        }
    }

    const handleRemoveTag = async (postId: string) => {
        try {
            await removeMyTag(postId)
            setPosts((prev) =>
                prev.map((p) =>
                    p.id === postId
                        ? { ...p, tags: p.tags?.filter((tag) => tag.user.id !== user?.id) }
                        : p,
                ),
            )
            toast.success(t('post.remove_tag_success'))
        } catch (err) {
            toast.error(t('post.remove_tag') + ' failed')
            console.log(err)
        }
    }

    useEffect(() => {
        if (!isAuthenticated) {
            socket.disconnect()
            return
        }

        const token = localStorage.getItem('accessToken')
        if (!token) {
            socket.disconnect()
            return
        }

        socket.auth = { token }
        socket.connect()

        socket.on('connect', () => {
            socket.emit('ping')
        })

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message)
        })

        return () => {
            socket.off('connect')
            socket.off('connect_error')
            socket.disconnect()
        }
    }, [isAuthenticated])

    useEffect(() => {
        if ("Notification" in window) {
            Notification.requestPermission()
        }
    }, [])

    useEffect(() => {
        if (!isAuthenticated) return

        const getPost = async () => {
            setLoadingPosts(true)

            try {
                const res = await getAllPost()
                setPosts(res.posts)
                setNextCursor(res.nextCursor)
            } catch (err) {
                console.error('Lỗi load posts:', err)
            } finally {
                setLoadingPosts(false)
            }
        }

        getPost()
    }, [isAuthenticated])

    const fetchMorePosts = useCallback(async () => {
        if (!nextCursor || loadingMore) return

        try {
            setLoadingMore(true)

            const res = await getAllPost(nextCursor)

            setPosts(prev => {
                return [...prev, ...res.posts]
            })

            setNextCursor(res.nextCursor)
        } finally {
            setLoadingMore(false)
        }
    }, [nextCursor, loadingMore])

    
    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <Router>
            <IncomingCallModal />

            {(inCall || calling) && activeCall && (
                <VideoCall
                    open={true}
                    username={activeCall.callerId === user?.id ? (activeCall.receiverName || 'User') : (activeCall.callerName || 'User')}
                    avatar={activeCall.callerId === user?.id ? activeCall.receiverAvatar : activeCall.callerAvatar}
                    onClose={() => {
                        if (activeCall) endCall(activeCall)
                    }}
                />
            )}
            
            {selectedStory && (
                <StoryViewer
                    story={selectedStory}
                    stories={mockStories}
                    onClose={() => setSelectedStory(null)}
                />
            )}

            <Routes>
                {/* Login */}
                <Route
                    path="/login"
                    element={
                        isAuthenticated
                            ? <Navigate to="/" replace />
                            : <AuthPage />
                    }
                />

                {/* Protected Routes */}
                <Route
                    element={
                        isAuthenticated
                            ? <MainLayout />
                            : <Navigate to="/login" replace />
                    }
                >
                    <Route
                        path="/"
                        element={
                            <Feed
                                posts={posts}
                                stories={mockStories}
                                onLike={handleLike}
                                onComment={handleComment}
                                onStoryClick={(story) => setSelectedStory(story)}
                                isLoading={loadingPosts}
                                nextCursor={nextCursor}
                                fetchMorePosts={fetchMorePosts}
                                onDeletePost={handleDeletePost}
                                onRemoveTag={handleRemoveTag}
                            />
                        }
                    />

                    <Route
                        path="/profile"
                        element={<Profile />}
                    />
                    <Route
                        path="/profile/:username"
                        element={<Profile />}
                    />

                    <Route
                        path="/search"
                        element={<Search />}
                    />

                    <Route
                        path="/create"
                        element={
                            <CreatePost
                                onClose={() => {}}
                                onPost={() => {}}
                            />
                        }
                    />

                    <Route
                        path="/notifications"
                        element={<Notifications />}
                    />
                </Route>

                {/* Route không tồn tại */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    )
}

export default App