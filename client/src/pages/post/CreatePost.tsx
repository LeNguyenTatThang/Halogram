import React, { useState } from 'react'
import { Upload, X, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { createPost } from '../../utils/post'

interface CreatePostProps {
    onClose: () => void;
    onPost: (images: string[], caption: string) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onClose, onPost }) => {
    const [step, setStep] = useState<'upload' | 'caption'>('upload')
    const [selectedImages, setSelectedImages] = useState<string[]>([])
    const [imageFiles, setImageFiles] = useState<File[]>([])
    const [caption, setCaption] = useState('')
    const { user } = useAuth()

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

    const handlePost = async () => {
        try {
            const formData = new FormData()
            formData.append('caption', caption)
            formData.append('status', '1')

            if(imageFiles.length > 0){
                imageFiles.forEach((file) => {
                formData.append('images', file)})
                console.log(formData)
            }
            
            const response = await createPost(formData)

            console.log(response)
            onPost(selectedImages, caption)
            onClose()
        } catch (error) {
            console.error(error)
        }
    }

    const mockImages = [
        'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400'
    ]

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
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {step === 'upload' ? (
                    <div className="p-6">
                        <div className="text-center mb-6">
                            <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            <p className="text-xl font-medium mb-2">Drag photos here</p>
                            <p className="text-gray-600 mb-4">or</p>
                            <label className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600 transition-colors">
                                Select from computer
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        <div className="border-t pt-6">
                            <p className="text-sm text-gray-600 mb-4">Or choose from these sample images:</p>
                            <div className="grid grid-cols-3 gap-2">
                                {mockImages.map((image, index) => (
                                    <img
                                        key={index}
                                        src={image}
                                        alt={`Sample ${index + 1}`}
                                        className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80"
                                        onClick={() => {
                                            setSelectedImages(images => [...images, image])
                                            setImageFiles([]) // sample images không gửi file
                                            setStep('caption')
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col h-96">
                        <div className="flex-1 overflow-y-auto">
                            <div className="p-4">
                                <div className="flex items-start space-x-3 mb-4">
                                    <img
                                        src={user?.avatar}
                                        alt={user?.username}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                    <div className="flex-1">
                                        <span className="font-semibold text-sm">{user?.username}</span>
                                        <textarea
                                            value={caption}
                                            onChange={(e) => setCaption(e.target.value)}
                                            placeholder="Write a caption..."
                                            className="w-full mt-2 text-sm border-none outline-none resize-none"
                                            rows={3}
                                        />
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
        </div>
    )
}

export default CreatePost