import React, { useState } from 'react'
import { X } from 'lucide-react'
import type { Post } from '../../types/Post'
import { updatePost } from '../../utils/post'

interface EditPostModalProps {
    post: Post
    onClose: () => void
    onSaved: (updated: Post) => void
}

const EditPostModal: React.FC<EditPostModalProps> = ({ post, onClose, onSaved }) => {
    const [caption, setCaption] = useState(post.caption ?? '')
    const [imageFiles, setImageFiles] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])
    const [saving, setSaving] = useState(false)

    const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? [])
        setImageFiles(files)
        setImagePreviews(files.map((f) => URL.createObjectURL(f)))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const formData = new FormData()
            formData.append('caption', caption)
            imageFiles.forEach((file) => formData.append('images', file))

            const res = await updatePost(post.id, formData)
            onSaved(res.post)
            onClose()
        } catch (err) {
            console.error('Failed to update post:', err)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center" onClick={onClose}>
            <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-lg mx-4 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold dark:text-white">Edit Post</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700">
                        <X className="w-5 h-5 dark:text-white" />
                    </button>
                </div>

                <div className="space-y-4">
                    {post.images?.[0] && imagePreviews.length === 0 && (
                        <img src={post.images[0].url} alt="Current" className="w-full h-48 object-cover rounded-lg" />
                    )}
                    {imagePreviews.length > 0 && (
                        <img src={imagePreviews[0]} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                    )}
                    <label className="block">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Change Image</span>
                        <input type="file" accept="image/*" multiple onChange={handleImagesChange}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-neutral-800 dark:file:text-blue-400" />
                    </label>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Caption</label>
                        <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={3}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700 transition">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition">
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EditPostModal
