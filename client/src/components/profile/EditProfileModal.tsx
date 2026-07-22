import React, { useState } from 'react'
import { X } from 'lucide-react'
import type { User } from '../../types/User'
import { updateProfile } from '../../utils/profile'

interface EditProfileModalProps {
    user: User
    onClose: () => void
    onSaved: (updated: User) => void
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onClose, onSaved }) => {
    const [displayName, setDisplayName] = useState(user.displayName)
    const [firstName, setFirstName] = useState(user.firstName)
    const [lastName, setLastName] = useState(user.lastName)
    const [bio, setBio] = useState(user.bio)
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState(user.avatar)
    const [saving, setSaving] = useState(false)

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setAvatarFile(file)
        setAvatarPreview(URL.createObjectURL(file))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const formData = new FormData()
            formData.append('displayName', displayName)
            formData.append('firstName', firstName)
            formData.append('lastName', lastName)
            formData.append('bio', bio)
            if (avatarFile) formData.append('avatar', avatarFile)

            const updated = await updateProfile(formData)
            onSaved(updated)
            onClose()
        } catch (err) {
            console.error('Failed to update profile:', err)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center" onClick={onClose}>
            <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-lg mx-4 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold dark:text-white">Edit Profile</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700">
                        <X className="w-5 h-5 dark:text-white" />
                    </button>
                </div>

                <div className="flex flex-col items-center mb-6">
                    <label className="cursor-pointer relative group">
                        <img
                            src={avatarPreview}
                            alt="Avatar"
                            className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 dark:border-neutral-600"
                        />
                        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                            <span className="text-white text-xs font-medium">Change</span>
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </label>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
                        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                            <input value={firstName} onChange={(e) => setFirstName(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                            <input value={lastName} onChange={(e) => setLastName(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
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

export default EditProfileModal
