import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Post as PostType } from '../../types/Post'
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { timeAgo } from '../../hooks/useTimeAgo'
import { useAuth } from '../../hooks/useAuth'
import defaultAvatarUrl from '../../assets/Logo.png'
import LazyImage from '../../components/common/LazyImage'
interface PostProps {
    post: PostType
    onLike: (postId: string) => void
    onComment: (postId: string, comment: string) => void
    onDelete?: (postId: string) => Promise<void>
    onRemoveTag?: (postId: string) => Promise<void>
}

function renderTagNames(
    tags: NonNullable<PostType['tags']>,
    currentUserId: string,
    navigate: ReturnType<typeof useNavigate>,
    t: (key: string, options?: Record<string, unknown>) => string,
) {
    const maxVisible = 2
    const names = tags.map((tag) => {
        const isYou = tag.user.id === currentUserId
        return {
            id: tag.user.id,
            username: tag.user.username,
            display: isYou ? t('post.tag_you') : (tag.user.displayName || tag.user.username),
            isYou,
        }
    })

    if (names.length === 1) {
        const n = names[0]
        return (
            <button
                onClick={() => navigate(`/profile/${n.username}`)}
                className="font-semibold text-blue-500 hover:text-blue-700"
            >
                {n.display}
            </button>
        )
    }

    if (names.length === 2) {
        return (
            <span>
                <button
                    onClick={() => navigate(`/profile/${names[0].username}`)}
                    className="font-semibold text-blue-500 hover:text-blue-700"
                >
                    {names[0].display}
                </button>
                <span>{t('post.tag_and')}</span>
                <button
                    onClick={() => navigate(`/profile/${names[1].username}`)}
                    className="font-semibold text-blue-500 hover:text-blue-700"
                >
                    {names[1].display}
                </button>
            </span>
        )
    }

    const visible = names.slice(0, maxVisible)
    const remaining = names.length - maxVisible
    return (
        <span>
            {visible.map((n, i) => (
                <span key={n.id}>
                    <button
                        onClick={() => navigate(`/profile/${n.username}`)}
                        className="font-semibold text-blue-500 hover:text-blue-700"
                    >
                        {n.display}
                    </button>
                    {i < visible.length - 1 && <span>, </span>}
                </span>
            ))}
            <span>
                {' '}{t('post.tag_and')}{' '}
                <span className="text-gray-500">
                    {t('post.tag_others', { count: remaining })}
                </span>
            </span>
        </span>
    )
}

const Post: React.FC<PostProps> = ({ post, onLike, onComment, onDelete, onRemoveTag }) => {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { user: currentUser } = useAuth()
    const [comment, setComment] = useState('')
    const [showAllComments, setShowAllComments] = useState(false)
    const [activeImageIndex, setActiveImageIndex] = useState(0)
    const touchStartX = useRef<number | null>(null)
    const touchEndX = useRef<number | null>(null)
    const [showHeart, setShowHeart] = useState(false)
    const [showMenu, setShowMenu] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showRemoveTagConfirm, setShowRemoveTagConfirm] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [removingTag, setRemovingTag] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    const isOwner = currentUser?.id === post.user?.id
    const isTagged = post.tags?.some((tag) => tag.user.id === currentUser?.id) ?? false

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false)
            }
        }
        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showMenu])

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault()
        if (comment.trim()) {
            onComment(post.id, comment)
            setComment('')
        }
    }

    const handleDelete = async () => {
        if (deleting || !onDelete) return
        setDeleting(true)
        try {
            await onDelete(post.id)
            setShowDeleteConfirm(false)
        } finally {
            setDeleting(false)
        }
    }

    const handleRemoveTag = async () => {
        if (removingTag || !onRemoveTag) return
        setRemovingTag(true)
        try {
            await onRemoveTag(post.id)
            setShowRemoveTagConfirm(false)
        } finally {
            setRemovingTag(false)
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

    const currentImage = images[activeImageIndex]

    return (
        <div className="bg-white border-b border-gray-200 pb-4 dark:bg-black dark:border-gray-700 dark:text-white">

            {/* HEADER */}
            <div className="flex items-center justify-between p-4">
                <button
                    onClick={() => navigate(`/profile/${post.user?.username}`)}
                    className="flex items-center space-x-3 flex-1 min-w-0 text-left"
                >
                    <img
                        src={
                            post.user?.avatar ||
                            'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400'
                        }
                        alt="User Avatar"
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />

                    <div className="min-w-0">
                        <div className="flex items-center space-x-1">
                            <span className="font-semibold text-sm truncate">
                                {post.user?.displayName ?? post.user?.username}
                            </span>
                        </div>

                        <span className="text-xs text-gray-500">
                            {timeAgo(post.createdAt)}
                        </span>
                    </div>
                </button>

                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setShowMenu((prev) => !prev)}
                        className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-700 transition-colors"
                    >
                        <MoreHorizontal className="w-5 h-5" />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700 z-50 py-1">
                            {isOwner && onDelete && (
                                <button
                                    onClick={() => {
                                        setShowMenu(false)
                                        setShowDeleteConfirm(true)
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-neutral-700 transition"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    {t('post.delete')}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* TAGGED USERS */}
            {post.tags && post.tags.length > 0 && (
                <div className="mb-1 px-4">
                    <span className="text-sm text-gray-500">
                        {t('post.tag_with')}{' '}
                        {renderTagNames(post.tags, currentUser?.id ?? '', navigate, t)}
                    </span>
                    {isTagged && onRemoveTag && (
                        <button
                            onClick={() => setShowRemoveTagConfirm(true)}
                            className="ml-2 text-xs text-red-500 hover:text-red-700 underline"
                        >
                            {t('post.remove_tag')}
                        </button>
                    )}
                </div>
            )}

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
                        {currentImage && (
                            <LazyImage
                                key={currentImage.id}
                                src={currentImage.url}
                                alt={`Post image ${activeImageIndex + 1}`}
                                wrapperClassName="h-full w-full"
                                className="h-full w-full object-cover"
                            />
                        )}

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

                        {!showAllComments && comments.length > 1 && (
                            <button
                                onClick={() => setShowAllComments(true)}
                                className="text-sm text-gray-500 mb-2 hover:underline"
                            >
                                View all comments
                            </button>
                        )}

                        {(showAllComments ? comments : [...comments].reverse()).map((c) => (
                            <div key={c.id} className="mb-1 flex items-center gap-1">
                                <button onClick={() => navigate(`/profile/${c.user?.username}`)}>
                                    <img
                                        src={c.user?.avatar ? c.user.avatar : defaultAvatarUrl}
                                        alt={c.user?.username}
                                        className="w-5 h-5 rounded-full flex-shrink-0"
                                    />
                                </button>
                                <button
                                    onClick={() => navigate(`/profile/${c.user?.username}`)}
                                    className="font-semibold text-sm hover:underline"
                                >
                                    {c.user?.username}
                                </button>
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

            {/* DELETE CONFIRMATION MODAL */}
            {showDeleteConfirm && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
                    onClick={() => !deleting && setShowDeleteConfirm(false)}
                >
                    <div
                        className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-sm mx-4 p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold dark:text-white mb-4">
                            {t('post.delete_confirm')}
                        </h3>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={deleting}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700 transition disabled:opacity-50"
                            >
                                {t('post.cancel')}
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition flex items-center gap-2"
                            >
                                {deleting ? t('post.delete_loading') : t('post.delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* REMOVE TAG CONFIRMATION MODAL */}
            {showRemoveTagConfirm && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
                    onClick={() => !removingTag && setShowRemoveTagConfirm(false)}
                >
                    <div
                        className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-sm mx-4 p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold dark:text-white mb-4">
                            {t('post.remove_tag_confirm')}
                        </h3>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowRemoveTagConfirm(false)}
                                disabled={removingTag}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700 transition disabled:opacity-50"
                            >
                                {t('post.cancel')}
                            </button>
                            <button
                                onClick={handleRemoveTag}
                                disabled={removingTag}
                                className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition flex items-center gap-2"
                            >
                                {removingTag ? t('post.remove_tag_loading') : t('post.remove_tag')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Post