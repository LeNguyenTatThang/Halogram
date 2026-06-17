import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

import Feed from '../../pages/post/Feed'

import { mockStories, currentUser } from '../../store/mockData'
import { getAllPost } from '../../utils/post'

import type { Post } from '../../types/Post'
import type { Story } from '../../types/Story'

const Home = () => {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()

    const [posts, setPosts] = useState<Post[]>([])
    const [stories] = useState<Story[]>(mockStories)
    const [activeTab] = useState('home')

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { replace: true })
            return
        }

        const fetchPosts = async () => {
            try {
                const res = await getAllPost()
                setPosts(res.data)
            } catch (err) {
                console.error('Lỗi load posts:', err)
            }
        }

        fetchPosts()
    }, [isAuthenticated, navigate])

    if (!isAuthenticated) {
        return <div>Loading...</div>
    }

    const handleLike = (postId: string) => {
        setPosts(prev =>
            prev.map(post =>
                post.id === postId
                    ? {
                          ...post,
                          isLiked: !post.isLiked,
                          likes: post.isLiked
                              ? post.likes - 1
                              : post.likes + 1,
                      }
                    : post
            )
        )
    }

    const handleComment = (
        postId: string,
        commentText: string
    ) => {
        setPosts(prev =>
            prev.map(post =>
                post.id === postId
                    ? {
                          ...post,
                          comments: [
                              ...post.comments,
                              {
                                  id: Date.now().toString(),
                                  user: currentUser,
                                  text: commentText,
                                  timestamp: 'now',
                                  likes: 0,
                              },
                          ],
                      }
                    : post
            )
        )
    }

    const handleStoryClick = (story: Story) => {
        console.log('Story clicked:', story)
    }

    return (
        <>
            {activeTab === 'home' && (
                <div className="md:pl-64 md:pr-64">
                    <main className="pb-16 md:pb-0">
                        <Feed
                            posts={posts}
                            stories={stories}
                            onLike={handleLike}
                            onComment={handleComment}
                            onStoryClick={handleStoryClick}
                        />
                    </main>
                </div>
            )}
        </>
    )
}

export default Home