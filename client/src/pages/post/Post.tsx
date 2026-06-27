import React, { useState } from 'react'
import type { Post as PostType } from '../../types/Post'
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react'

interface PostProps {
    post: PostType
    onLike: (postId: string) => void
    onComment: (postId: string, comment: string) => void
}

const Post: React.FC<PostProps> = ({ post, onLike, onComment }) => {
    const [comment, setComment] = useState('')
    const [showAllComments, setShowAllComments] = useState(false)

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault()
        if (comment.trim()) {
            onComment(post.id, comment)
            setComment('')
        }
    }

    const comments = post.comments ?? []

    return (
        <div className="bg-white border-b border-gray-200 pb-4 dark:bg-black dark:border-gray-700 dark:text-white">

            {/* HEADER */}
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                    <img
                        src={
                            post.user?.avatar ||
                            'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400'
                        }
                        alt="User Avatar"
                        className="w-8 h-8 rounded-full object-cover"
                    />

                    <div>
                        <div className="flex items-center space-x-1">
                            <span className="font-semibold text-sm">
                                {post.user?.displayName ?? post.user?.username}
                            </span>
                        </div>

                        <span className="text-xs text-gray-500">
                            {new Date(post.createdAt).toLocaleString()}
                        </span>
                    </div>
                </div>

                <button className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-700 transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            {/* CAPTION */}
            <div className="mb-2 px-4">
                <span className="text-sm">{post.caption}</span>
            </div>

            {/* IMAGES */}
            {(post.images ?? []).length > 0 && (
                <div className="relative">
                    {(post.images ?? []).map((img) => (
                    <img
                        key={img.id}
                        src={img.url}
                        alt="Post"
                        className="w-full aspect-square object-cover"
                    />
                    ))}
                </div>
            )}

            {/* ACTIONS */}
            <div className="px-4 pt-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => onLike(post.id)}>
                            <Heart
                                className={`w-6 h-6 ${
                                    post.isLiked ? 'fill-red-500 text-red-500' : ''
                                }`}
                            />
                        </button>

                        <MessageCircle className="w-6 h-6" />
                        <Send className="w-6 h-6" />
                    </div>

                    <Bookmark className="w-6 h-6" />
                </div>

                {/* LIKES */}
                <div className="mb-2">
                    <span className="font-semibold text-sm">
                        {post._count?.likes ?? 0} likes
                    </span>
                </div>

                {/* COMMENTS */}
                {comments.length > 0 && (
                    <div className="mb-3">

                        {!showAllComments && comments.length > 2 && (
                            <button
                                onClick={() => setShowAllComments(true)}
                                className="text-sm text-gray-500 mb-2 hover:underline"
                            >
                                View all {comments.length} comments
                            </button>
                        )}

                        {(showAllComments ? comments : comments.slice(0, 2)).map((c) => (
                            <div key={c.id} className="mb-1">
                                <span className="font-semibold text-sm mr-2">
                                    {c.user?.username}
                                </span>
                                <span className="text-sm">{c.text}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* COMMENT INPUT */}
                <form onSubmit={handleSubmitComment} className="flex items-center space-x-3">
                    <input
                        type="text"
                        placeholder="Add a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="flex-1 text-sm border-none outline-none bg-transparent"
                    />

                    {comment.trim() && (
                        <button type="submit" className="text-sm font-semibold text-blue-500">
                            Post
                        </button>
                    )}
                </form>
            </div>
        </div>
    )
}

export default Post