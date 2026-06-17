"use client"
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

    return (
        <div className="bg-white border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                    <img
                        src={post.user?.avatar ? post.user?.avatar : 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400'}
                        alt={post.caption}
                        className="w-8 h-8 rounded-full object-cover"
                        width={8}
                        height={8}
                    />
                    <div>
                        <div className="flex items-center space-x-1">
                            <span className="font-semibold text-sm">{post.user?.firstName} {post.user?.lastName}</span>

                            <div className="w-3 h-3 pt-1 flex items-center justify-center">
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="text-blue-400" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                                    <path fill="none" d="M0 0h24v24H0z"></path>
                                    <path d="m23 12-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 12zm-12.91 4.72-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35z"></path>
                                </svg>
                            </div>

                        </div>
                        <span className="text-xs text-gray-500">{post.timestamp}</span>
                    </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                    <MoreHorizontal className="w-5 h-5 text-gray-600" />
                </button>
            </div>
            <div className="mb-2">
                <span className="text-sm">{post.caption}</span>
            </div>

            {post.image && (
                <div className="relative">
                    <img
                        src={post.image}
                        alt="Post"
                        className="w-full aspect-square object-cover"
                        width={1000}
                        height={1000}
                    />
                </div>
            )}

            <div className="px-4 pt-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => onLike(post.id)}
                            className="hover:bg-gray-100 p-2 rounded-full -ml-2 transition-colors"
                        >
                            <Heart
                                className={`w-6 h-6 ${post.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700'
                                    }`}
                            />
                        </button>
                        <button className="hover:bg-gray-100 p-2 rounded-full transition-colors">
                            <MessageCircle className="w-6 h-6 text-gray-700" />
                        </button>
                        <button className="hover:bg-gray-100 p-2 rounded-full transition-colors">
                            <Send className="w-6 h-6 text-gray-700" />
                        </button>
                    </div>
                    <button className="hover:bg-gray-100 p-2 rounded-full transition-colors">
                        <Bookmark className="w-6 h-6 text-gray-700" />
                    </button>
                </div>

                <div className="mb-2">
                    <span className="font-semibold text-sm">{post.likes} likes</span>
                </div>

                {post.comments?.length > 0 && (
                    <div className="mb-3">
                        {!showAllComments && post.comments.length > 2 && (
                            <button
                                onClick={() => setShowAllComments(true)}
                                className="text-sm text-gray-500 mb-2 hover:underline"
                            >
                                View all {post.comments.length} comments
                            </button>
                        )}
                        {(showAllComments ? post.comments : post.comments.slice(0, 2)).map((comment) => (
                            <div key={comment.id} className="mb-1">
                                <span className="font-semibold text-sm mr-2">{comment.user.username}</span>
                                <span className="text-sm">{comment.text}</span>
                            </div>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSubmitComment} className="flex items-center space-x-3">
                    <input
                        type="text"
                        placeholder="Add a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="flex-1 text-sm border-none outline-none bg-transparent"
                    />
                    {comment.trim() && (
                        <button
                            type="submit"
                            className="text-sm font-semibold text-blue-500 hover:text-blue-700"
                        >
                            Post
                        </button>
                    )}
                </form>
            </div>
        </div>
    )
}

export default Post