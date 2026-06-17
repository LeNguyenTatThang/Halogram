import './App.css'
import AuthPage from './pages/auth/AuthPage'
import Navigation from './layouts/Navigation'
import Feed from './pages/post/Feed'
import Profile from './pages/user/Profile'
import Search from './pages/search/Search'
import CreatePost from './pages/post/CreatePost'
import Notifications from './pages/notifications/Notifications'
import Online from './layouts/Online'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { currentUser, mockPosts, mockStories } from './store/mockData'

function App() {

  return (
    <>
      <Router>
        <Navigation locale="en" />
        <Online  />
        <div className="ml-64">
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/" element={<Feed posts={mockPosts} stories={mockStories} onLike={() => { }} onComment={() => { }} onStoryClick={() => { }} />} />
            <Route path="/profile" element={<Profile user={currentUser} posts={mockPosts} isOwnProfile={true} onFollow={() => { }} />} />
            <Route path="/search" element={<Search />} />
            <Route path="/create" element={<CreatePost onClose={() => { }} onPost={() => { }} />} />
            <Route path="/notifications" element={<Notifications />} />
          </Routes>
        </div>
      </Router>
    </>
  )
}

export default App
