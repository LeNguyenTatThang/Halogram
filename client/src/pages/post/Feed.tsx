import React from 'react'
import type { Post as PostType } from '../../types/Post'
import type { Story } from '../../types/Story'
import  Post from './Post'
import Stories from '../user/Stories'

interface FeedProps {
    posts: PostType[]
    stories: Story[]
    onLike: (postId: string) => void
    onComment: (postId: string, comment: string) => void
    onStoryClick: (story: Story) => void
}

const Feed: React.FC<FeedProps> = ({ posts, stories, onLike, onComment, onStoryClick }) => {
    return (
        <div className="max-w-md mx-auto bg-white dark:bg-black">
            <Stories stories={stories} onStoryClick={onStoryClick} />
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {posts.map((post) => (
                    <Post
                        key={post.id}
                        post={post}
                        onLike={onLike}
                        onComment={onComment}
                    />
                ))}
            </div>
        </div>
    )
}

export default Feed