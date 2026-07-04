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

function App() {
    const { isAuthenticated, loading  } = useAuth()
    const [posts, setPosts] = useState<Post[]>([])
    const [nextCursor, setNextCursor] = useState<string | undefined>()
    const [loadingMore, setLoadingMore] = useState(false)

    useEffect(() => {
        if (!isAuthenticated) return

        const getPost = async () => {
            try {
                const res = await getAllPost()
                setPosts(res.posts)
                setNextCursor(res.nextCursor)
            } catch (err) {
                console.error('Lỗi load posts:', err)
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
                                onLike={() => {}}
                                onComment={() => {}}
                                onStoryClick={() => {}}
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