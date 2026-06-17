import type {User} from '../types/User'
import type {Post} from '../types/Post'
import type {Story} from '../types/Story'

export const currentUser: User = {
    id: '1',
    username: 'john_doe',
    displayName: 'John Doe',
    email: 'G5F6o@example.com',
    firstName: 'John',
    lastName: 'Doe',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'Just a regular guy who loves photography and travel.',
    friends: 150,
    followers: 200,
    following: 100,
    posts: 50,
    isVerified: true
}

export const mockUsers: User[] = [
    {
        id: '2',
        username: 'jane_smith',
        displayName: 'Jane Smith',
        email: 'KqF7o@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
        bio: 'Photographer and travel enthusiast.',
        friends: 100,
        followers: 150,
        following: 50,
        posts: 30,
        isVerified: false
    },
    {
        id: '3',
        username: 'alice_wonder',
        displayName: 'Alice Wonder',
        email: 'V4E7r@example.com',
        firstName: 'Alice',
        lastName: 'Wonder',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
        bio: 'Photographer and travel enthusiast.',
        friends: 100,
        followers: 150,
        following: 50,
        posts: 30,
        isVerified: false
    },
    {
        id: '4',
        username: 'bob_doe',
        displayName: 'Bob Doe',
        email: 'KqF7o@example.com',
        firstName: 'Bob',
        lastName: 'Doe',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
        bio: 'Photographer and travel enthusiast.',
        friends: 100,
        followers: 150,
        following: 50,
        posts: 30,
        isVerified: false
    }
]

export const mockPosts: Post[] = [
    {
        id: '1',
        user: mockUsers[0],
        image: 'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=800',
        caption: 'Beautiful sunset at the beach 🌅 #sunset #beach #nature',
        likes: 342,
        comments: [
            {
                id: '1',
                user: mockUsers[1],
                text: 'Stunning view! 😍',
                timestamp: '2h',
                likes: 12,
            },
            {
                id: '2',
                user: currentUser,
                text: 'Amazing colors!',
                timestamp: '1h',
                likes: 5,
            }
        ],
        timestamp: '3h',
        isLiked: true
    },
    {
        id: '2',
        user: mockUsers[1],
        image: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=800',
        caption: 'Working on some new code today 💻 #coding #developer #tech',
        likes: 156,
        comments: [],
        timestamp: '5h',
        isLiked: false
    },
    {
        id: '3',
        user: mockUsers[2],
        image: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=800',
        caption: 'Latest artwork finished! What do you think? 🎨 #art #design #creative',
        likes: 289,
        comments: [
            {
                id: '3',
                user: mockUsers[0],
                text: 'This is incredible! 🔥',
                timestamp: '30m',
                likes: 8,
            },
        ],
        timestamp: '1d',
        isLiked: true
    }
]

export const mockStories: Story[] = [
    {
        id: '1',
        user: currentUser,
        image: 'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=400',
        timestamp: '2h',
        isViewed: false
    },
    {
        id: '2',
        user: mockUsers[0],
        image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
        timestamp: '4h',
        isViewed: true
    },
    {
        id: '3',
        user: mockUsers[1],
        image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
        timestamp: '6h',
        isViewed: false
    }
]