import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import AuthPage from './pages/auth/AuthPage'
import Feed from './pages/post/Feed'
import Profile from './pages/user/Profile'
import Search from './pages/search/Search'
import CreatePost from './pages/post/CreatePost'
import Notifications from './pages/notifications/Notifications'
import { Navigate } from 'react-router-dom'
import { currentUser, mockPosts, mockStories } from './store/mockData'
import MainLayout from './layouts/MainLayout'
import { useAuth } from './hooks/useAuth'

function App() {
    const {isAuthenticated} = useAuth()
    
    return (
        <Router>
            <Routes>
                {/* Không dùng layout */}
                <Route
                    path="/login"
                    element={
                        isAuthenticated
                            ? <Navigate to="/" replace />
                            : <AuthPage />
                    }
                />

                {/* Dùng layout */}
                <Route element={<MainLayout />}>
                    <Route
                        path="/"
                        element={
                            <Feed
                                posts={mockPosts}
                                stories={mockStories}
                                onLike={() => {}}
                                onComment={() => {}}
                                onStoryClick={() => {}}
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
                    <Route path="/search" element={<Search />} />
                    <Route path="/create" element={<CreatePost onClose={() => {}} onPost={() => {}} />} />
                    <Route path="/notifications" element={<Notifications />} />
                </Route>
            </Routes>
        </Router>
    )
}

export default App