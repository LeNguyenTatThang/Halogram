import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Upload, X, ArrowLeft, UserPlus, Camera } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { createPost } from '../../utils/post'
import TagFriendsModal from '../../components/post/TagFriendsModal'
import VerifiedBadge from '../../components/common/VerifiedBadge'
import UserAvatar from '../../components/ui/UserAvatar'

interface CreatePostProps {
    onClose: () => void;
    onPost: (images: string[], caption: string) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onClose, onPost }) => {
    const navigate = useNavigate()
    const [step, setStep] = useState<'upload' | 'caption'>('upload')
    const [selectedImages, setSelectedImages] = useState<string[]>([])
    const [imageFiles, setImageFiles] = useState<File[]>([])
    const [caption, setCaption] = useState('')
    const [tagUserIds, setTagUserIds] = useState<string[]>([])
    const [showTagModal, setShowTagModal] = useState(false)
    const [showCamera, setShowCamera] = useState(false)
    const mediaStreamRef = useRef<MediaStream | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const { user } = useAuth()

    const stopCamera = () => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop())
            mediaStreamRef.current = null
        }
        setShowCamera(false)
    }

    useEffect(() => {
        return () => {
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop())
            }
        }
    }, [])

    const startCamera = async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            toast.error('Camera is not supported by your browser')
            return
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: false,
            })
            mediaStreamRef.current = stream
            setShowCamera(true)
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                }
            }, 0)
        } catch (err: unknown) {
            if (err instanceof DOMException) {
                if (err.name === 'NotAllowedError') {
                    toast.error('Camera permission denied. Please allow camera access.')
                } else if (err.name === 'NotFoundError') {
                    toast.error('No camera found on your device.')
                } else if (err.name === 'NotReadableError') {
                    toast.error('Camera is being used by another application.')
                } else {
                    toast.error('Could not access camera.')
                }
            } else {
                toast.error('Could not access camera.')
            }
        }
    }

    const capturePhoto = () => {
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas) return

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.drawImage(video, 0, 0)

        canvas.toBlob((blob) => {
            if (!blob) return
            const file = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' })
            const reader = new FileReader()
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string
                setImageFiles(prev => [...prev, file])
                setSelectedImages(prev => [...prev, dataUrl])
            }
            reader.readAsDataURL(blob)
            stopCamera()
            setStep('caption')
        }, 'image/jpeg', 0.9)
    }

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? [])
        if (!files.length) return
        setImageFiles(files)
        Promise.all(
            files.map(
                (file) =>
                    new Promise<string>((resolve) => {
                        const reader = new FileReader()

                        reader.onload = (e) => {
                            resolve(e.target?.result as string)
                        }

                        reader.readAsDataURL(file)
                    }),
            ),
        ).then((images) => {
            setSelectedImages(images)
            setStep('caption')
        })
    }

    const handlePost = () => {
        const formData = new FormData()
        formData.append('caption', caption)
        formData.append('status', '1')

        if(imageFiles.length > 0){
            imageFiles.forEach((file) => {
            formData.append('images', file)})
        }

        if (tagUserIds.length > 0) {
            formData.append('tagUserIds', JSON.stringify(tagUserIds))
        }

        toast.loading('Đang đăng bài...')

        onPost(selectedImages, caption)
        onClose()
        navigate('/')

        createPost(formData)
            .then(() => {
                toast.dismiss()
                toast.success('Đăng bài thành công')
            })
            .catch(() => {
                toast.dismiss()
                toast.error('Đăng bài thất bại')
            })
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                    {step === 'caption' && (
                        <button
                            onClick={() => setStep('upload')}
                            className="p-2 hover:bg-gray-100 rounded-full"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <h2 className="text-lg font-semibold">
                        {step === 'upload' ? 'Create new post' : 'New post'}
                    </h2>
                    <button
                        onClick={() => {
                            stopCamera()
                            onClose()
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {step === 'upload' ? (
                    <div className="p-6">
                        {showCamera ? (
                            <div className="text-center">
                                <div className="relative bg-black rounded-lg overflow-hidden mb-4 mx-auto max-w-sm">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        muted
                                        playsInline
                                        className="w-full h-80 object-cover"
                                    />
                                    <canvas ref={canvasRef} className="hidden" />
                                </div>
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={capturePhoto}
                                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        Capture
                                    </button>
                                    <button
                                        onClick={stopCamera}
                                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Cancel Camera
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center mb-6">
                                <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                                <p className="text-xl font-medium mb-2">Drag photos here</p>
                                <p className="text-gray-600 mb-4">or</p>
                                <label className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600 transition-colors inline-block">
                                    Select from computer
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                                <div className="mt-4 flex items-center gap-3">
                                    <div className="flex-1 h-px bg-gray-200" />
                                    <span className="text-gray-400 text-sm">or</span>
                                    <div className="flex-1 h-px bg-gray-200" />
                                </div>
                                <button
                                    onClick={startCamera}
                                    className="mt-4 flex items-center gap-2 mx-auto text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                                >
                                    <Camera className="w-5 h-5" />
                                    Open Camera
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col h-96">
                        <div className="flex-1 overflow-y-auto">
                            <div className="p-4">
                                <div className="flex items-start space-x-3 mb-4">
                                    <UserAvatar src={user?.avatar} name={user?.displayName || user?.username} size={32} />
                                    <div className="flex-1">
                                        <span className="font-semibold text-sm inline-flex items-center gap-0.5">{user?.username}{user?.isVerified && <VerifiedBadge />}</span>
                                        <textarea
                                            value={caption}
                                            onChange={(e) => setCaption(e.target.value)}
                                            placeholder="Write a caption..."
                                            className="w-full mt-2 text-sm border-none outline-none resize-none"
                                            rows={3}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowTagModal(true)}
                                            className="flex items-center gap-1 mt-2 text-sm text-blue-500 hover:text-blue-600"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                            {tagUserIds.length > 0
                                                ? `Tag ${tagUserIds.length} friend${tagUserIds.length > 1 ? 's' : ''}`
                                                : 'Tag friends'}
                                        </button>
                                    </div>
                                </div>

                                {selectedImages && (
                                    <div className="mt-4">
                                        <img
                                            src={selectedImages[0]}
                                            alt="Selected"
                                            className="w-full h-40 object-cover rounded-lg"
                                        />
                                    </div>
                                )}
                                {selectedImages.length > 0 && (
                                    <div className="grid grid-cols-2 gap-2 mt-4">
                                        {selectedImages.map((image, index) => (
                                            <img
                                                key={index}
                                                src={image}
                                                className="w-full h-40 object-cover rounded-lg"
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 border-t">
                            <button
                                onClick={handlePost}
                                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Share
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showTagModal && (
                <TagFriendsModal
                    selectedIds={tagUserIds}
                    onConfirm={(ids) => {
                        setTagUserIds(ids)
                        setShowTagModal(false)
                    }}
                    onClose={() => setShowTagModal(false)}
                />
            )}
        </div>
    )
}

export default CreatePost