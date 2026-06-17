import React from 'react'
import type { Story } from '../../types/Story'
import { Plus } from 'lucide-react'
// import { useAuth } from '../../hooks/useAuth'

interface StoriesProps {
    stories: Story[]
    onStoryClick: (story: Story) => void
}

const Stories: React.FC<StoriesProps> = ({ stories, onStoryClick }) => {
    // const { user } = useAuth()

    return (
        <div className="bg-white border-b border-gray-200 px-4 py-4">
            <div className="flex space-x-4 overflow-x-auto">
                <div className="flex-shrink-0 text-center">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-0.5">
                            <div className="w-full h-full rounded-full bg-white p-0.5">
                                <img
                                    src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400"
                                    alt="Your Story"
                                    className="w-full h-full rounded-full object-cover"
                                />
                            </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                            <Plus className="w-3 h-3 text-white" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-900 mt-1 truncate w-16">Your story</p>
                </div>

                {stories.map((story) => (
                    <div
                        key={story.id}
                        className="flex-shrink-0 text-center cursor-pointer"
                        onClick={() => onStoryClick(story)}
                    >
                        <div className={`w-16 h-16 rounded-full p-0.5 ${story.isViewed
                            ? 'bg-gray-300'
                            : 'bg-gradient-to-r from-purple-500 to-pink-500'
                            }`}>
                            <div className="w-full h-full rounded-full bg-white p-0.5">
                                <img
                                    src={story.user.avatar}
                                    alt={story.user.username}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-900 mt-1 truncate w-16">
                            {story.user.username}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Stories