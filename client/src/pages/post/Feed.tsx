import React from 'react'
import type { Post as PostType } from '../../types/Post'
import type { Story } from '../../types/Story'
import  Post from './Post'
import Stories from '../user/Stories'
import SuggestedUsers from './SuggestedUsers'

interface FeedProps {
    posts: PostType[]
    stories: Story[]
    onLike: (postId: string) => void
    onComment: (postId: string, comment: string) => void
    onStoryClick: (story: Story) => void
}

const Feed: React.FC<FeedProps> = ({ posts, stories, onLike, onComment, onStoryClick }) => {
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
            </div>

            
        </div>
    )
}

export default Feed