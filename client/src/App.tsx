import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import AuthPage from './pages/auth/AuthPage'
import Feed from './pages/post/Feed'
import Profile from './pages/user/Profile'
import Search from './pages/search/Search'
import CreatePost from './pages/post/CreatePost'
import Notifications from './pages/notifications/Notifications'
import MainLayout from './layouts/MainLayout'
import { useAuth } from './hooks/useAuth'
import { currentUser, mockPosts, mockStories } from './store/mockData'
import { getAllPost } from './utils/post'
import type { Post } from './types/Post'
import NotFound from './pages/not-found/NotFound'
import { likePost } from './utils/like'
import { playSound } from './utils/sound'
import { createComment } from './utils/comment'
import StoryViewer from './components/common/StoryViewer'
import type { Story } from './types/Story'

function App() {
    const { isAuthenticated, loading  } = useAuth()
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
                            />
                        }
                    />

                    <Route
                        path="/profile"
                        element={
                            <Profile
                                user={currentUser}
                                posts={mockPosts}
                                isOwnProfile={true}
                                onFollow={() => {}}
                            />
                        }
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