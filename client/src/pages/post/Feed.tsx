import React, { useEffect, useRef } from 'react'
import type { Post as PostType } from '../../types/Post'
import type { Story } from '../../types/Story'
import  Post from './Post'
import Stories from '../user/Stories'
import SuggestedUsers from './SuggestedUsers'

interface FeedProps {
    posts: PostType[]
    stories: Story[]

    nextCursor?: string
    fetchMorePosts?: () => void

    onLike: (postId: string) => void
    onComment: (postId: string, comment: string) => void
    onStoryClick: (story: Story) => void
}

const Feed: React.FC<FeedProps> = ({ posts, stories, onLike, onComment, onStoryClick, nextCursor, fetchMorePosts }) => {
    const loadMoreRef = useRef<HTMLDivElement | null>(null)

    useEffect(() =>{
        if (!loadMoreRef.current) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && nextCursor && fetchMorePosts) {
                    fetchMorePosts?.()
                }
            },
            {
                threshold: 1,
            }
        )

        if (!loadMoreRef.current) {
            observer.disconnect()
        }

        observer.observe(loadMoreRef.current)
        return () => observer.disconnect()
    }, [nextCursor, fetchMorePosts])
    return (
        <div className="ml-10 flex max-w-7xl items-start justify-center gap-8 px-4">
            {/* Sidebar */}
            <aside className="hidden lg:block w-80 sticky top-6">
                <SuggestedUsers />
            </aside>
            {/* Feed */}
            <div className="w-full max-w-xl ">
                <Stories
                    stories={stories}
                    onStoryClick={onStoryClick}
                />

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {posts.map(post => (
                        <Post
                            key={post.id}
                            post={post}
                            onLike={onLike}
                            onComment={onComment}
                        />
                    ))}
                </div>
                <div 
                    ref={loadMoreRef}
                    className='h-16 flex items-center justify-center text-gray-500 dark:text-gray-400'>
                        {nextCursor ? 'Loading more posts...' : 'No more posts'}
                </div>
            </div>
            
            
        </div>
    )
}

export default Feed