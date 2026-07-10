import React, { useRef, useState } from 'react'
import type { Post as PostType } from '../../types/Post'
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import { timeAgo } from '../../hooks/useTimeAgo'

interface PostProps {
    post: PostType
    onLike: (postId: string) => void
    onComment: (postId: string, comment: string) => void
}

const Post: React.FC<PostProps> = ({ post, onLike, onComment }) => {
    const [comment, setComment] = useState('')
    const [showAllComments, setShowAllComments] = useState(false)
    const [activeImageIndex, setActiveImageIndex] = useState(0)
    const touchStartX = useRef<number | null>(null)
    const touchEndX = useRef<number | null>(null)
    const [showHeart, setShowHeart] = useState(false)
    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault()
        if (comment.trim()) {
            onComment(post.id, comment)
            setComment('')
        }
    }

    const comments = post.comments ?? []
    const images = post.images ?? []
    const hasMultipleImages = images.length > 1

    const goToPreviousImage = () => {
        setActiveImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))
    }

    const goToNextImage = () => {
        setActiveImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))
    }

    const handleTouchStart = (event: React.TouchEvent) => {
        touchStartX.current = event.touches[0].clientX
    }

    const handleTouchEnd = (event: React.TouchEvent) => {
        touchEndX.current = event.changedTouches[0].clientX
        if (touchStartX.current === null || touchEndX.current === null) return

        const delta = touchStartX.current - touchEndX.current
        if (delta > 50) {
            goToNextImage()
        } else if (delta < -50) {
            goToPreviousImage()
        }

        touchStartX.current = null
        touchEndX.current = null
    }

    const handleDoubleClick = () => {
        setShowHeart(true)

        if (!post.isLiked) {
            onLike(post.id)
        }

        setTimeout(() => setShowHeart(false), 600)
    }

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
                            {timeAgo(post.createdAt)}
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
            {images.length > 0 && (
                <div
                    className="relative overflow-hidden bg-black"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onDoubleClick={handleDoubleClick}
                >
                    {showHeart && (
                        <Heart
                            className="absolute left-1/2 top-1/2 h-24 w-24
                                    -translate-x-1/2 -translate-y-1/2
                                    fill-white text-white
                                    pointer-events-none"
                        />
                    )}
                    <div className="relative w-full aspect-square overflow-hidden">
                        <img
                            key={images[activeImageIndex]?.id}
                            src={images[activeImageIndex]?.url}
                            alt="Post"
                            className="h-full w-full object-cover transition-all duration-300"
                        />

                        {hasMultipleImages && (
                            <>
                                <button
                                    type="button"
                                    onClick={goToPreviousImage}
                                    className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>

                                <button
                                    type="button"
                                    onClick={goToNextImage}
                                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </>
                        )}
                    </div>

                    {hasMultipleImages && (
                        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-sm">
                            {images.map((_, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => setActiveImageIndex(index)}
                                    className={`h-1.75 w-1.75 rounded-full transition ${index === activeImageIndex ? 'bg-white' : 'bg-white/50'}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ACTIONS */}
            <div className="px-4 pt-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => onLike(post.id)}>
                            <Heart
                                className={`w-6 h-6 cursor-pointer ${
                                    post.isLiked ? 'fill-red-500 text-red-500' : ''
                                }`}
                            />
                        </button>

                        <MessageCircle className="w-6 h-6 cursor-pointer" />
                        <Send className="w-6 h-6 cursor-pointer" />
                    </div>

                    <Bookmark className="w-6 h-6 cursor-pointer" />
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