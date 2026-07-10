import React, { useState, useEffect } from 'react'
import type { Story } from '../../types/Story'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface StoryViewerProps {
    story: Story
    stories: Story[]
    onClose: () => void
}

const StoryViewer: React.FC<StoryViewerProps> = ({ story: initialStory, stories, onClose }) => {
    const [currentStoryIndex, setCurrentStoryIndex] = useState(
        stories.findIndex(s => s.id === initialStory.id)
    )
    const [progress, setProgress] = useState(0)

    const currentStory = stories[currentStoryIndex]

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    handleNextStory()
                    return 0
                }
                return prev + (100 / 50) // 5 seconds per story
            })
        }, 100)

        return () => clearInterval(timer)
    }, [currentStoryIndex])

    const handleNextStory = () => {
        if (currentStoryIndex < stories.length - 1) {
            setCurrentStoryIndex(currentStoryIndex + 1)
            setProgress(0)
        } else {
            onClose()
        }
    }

    const handlePrevStory = () => {
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(currentStoryIndex - 1)
            setProgress(0)
        }
    }

    const handleClickNext = (e: React.MouseEvent) => {
        e.stopPropagation()
        handleNextStory()
    }

    const handleClickPrev = (e: React.MouseEvent) => {
        e.stopPropagation()
        handlePrevStory()
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
            >
                <div className="relative w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
                    {/* Progress bars */}
                    <div className="absolute top-4 left-0 right-0 flex gap-1 px-4 z-10">
                        {stories.map((_, index) => (
                            <div key={index} className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white transition-all duration-100"
                                    style={{
                                        width: index < currentStoryIndex ? '100%' : index === currentStoryIndex ? `${progress}%` : '0%'
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Header */}
                    <div className="absolute top-8 left-0 right-0 flex items-center justify-between px-6 z-10">
                        <div className="flex items-center gap-3">
                            <img
                                src={currentStory.user.avatar}
                                alt={currentStory.user.username}
                                className="w-10 h-10 rounded-full object-cover border-2 border-white"
                            />
                            <div>
                                <p className="text-white font-semibold text-sm">{currentStory.user.username}</p>
                                <p className="text-gray-300 text-xs">2 hours ago</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Story content */}
                    <div className="relative w-full max-w-sm h-screen max-h-screen md:max-h-[80vh] md:rounded-2xl overflow-hidden">
                        <img
                            src={currentStory.image}
                            alt="Story"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Navigation buttons */}
                    {currentStoryIndex > 0 && (
                        <button
                            onClick={handleClickPrev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white hover:bg-opacity-20 p-3 rounded-full transition z-10"
                        >
                            <ChevronLeft size={32} />
                        </button>
                    )}

                    {currentStoryIndex < stories.length - 1 && (
                        <button
                            onClick={handleClickNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white hover:bg-opacity-20 p-3 rounded-full transition z-10"
                        >
                            <ChevronRight size={32} />
                        </button>
                    )}

                    {/* Click to next area */}
                    <div
                        onClick={handleClickNext}
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-1/4 h-full cursor-pointer"
                    />
                </div>
            </motion.div>
        </AnimatePresence>
    )
}

export default StoryViewer
