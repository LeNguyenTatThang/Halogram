import React, { useEffect, useRef } from 'react'
import type { Post as PostType } from '../../types/Post'
import type { Story } from '../../types/Story'
import  Post from './Post'
import Stories from '../user/Stories'
import SuggestedUsers from './SuggestedUsers'

interface FeedProps {
    posts: PostType[]
    stories: Story[]
    isLoading?: boolean

    nextCursor?: string
    fetchMorePosts?: () => void

    onLike: (postId: string) => void
    onComment: (postId: string, comment: string) => void
    onStoryClick: (story: Story) => void
    onDeletePost?: (postId: string) => Promise<void>
    onRemoveTag?: (postId: string) => Promise<void>
}

const Feed: React.FC<FeedProps> = ({ posts, stories, isLoading = false, onLike, onComment, onStoryClick, nextCursor, fetchMorePosts, onDeletePost, onRemoveTag }) => {
    const loadMoreRef = useRef<HTMLDivElement | null>(null)

    const handleStoryClick = (story: Story) => {
        onStoryClick(story)
    }
    

    useEffect(() =>{
        if (!loadMoreRef.current) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && nextCursor && fetchMorePosts) {
                    fetchMorePosts?.()
                }
            },
            {
                threshold: 0.1,
            }
        )

        observer.observe(loadMoreRef.current)
        return () => observer.disconnect()
    }, [nextCursor, fetchMorePosts])
    return (
        <div className="ml-10 mx-auto flex justify-center min-w-2xl:max-w-7xl max-w-7xl items-start justify-center gap-8 px-4">
            {/* Sidebar */}
            <aside className="2xl:block hidden w-80 sticky top-6">
                <SuggestedUsers />
            </aside>
            {/* Feed */}
            <div className="w-full max-w-xl min-h-[320px]">
                <Stories
                    stories={stories}
                    onStoryClick={handleStoryClick}
                />

                {isLoading && posts.length === 0 ? (
                    <div className="space-y-4 py-4" role="status" aria-live="polite">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="animate-pulse rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-black">
                                <div className="mb-3 flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                                        <div className="h-2.5 w-16 rounded bg-gray-100 dark:bg-gray-800" />
                                    </div>
                                </div>
                                <div className="mb-3 h-72 rounded-xl bg-gray-200 dark:bg-gray-700" />
                                <div className="h-3 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {posts.map(post => (
                            <Post
                                key={post.id}
                                post={post}
                                onLike={onLike}
                                onComment={onComment}
                                onDelete={onDeletePost}
                                onRemoveTag={onRemoveTag}
                            />
                        ))}
                    </div>
                )}

                <div 
                    ref={loadMoreRef}
                    className='mt-4 flex min-h-16 items-center justify-center text-sm text-gray-500 dark:text-gray-400'>
                        {nextCursor ? 'Loading more posts...' : 'No more posts'}
                </div>
            </div>
        </div>
    )
}

export default Feed