import {
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react'

import AuthContext from './auth-context'

import type { User } from '../types/User'

import {
    loginUser,
    getCurrentUser,
    register,
} from '../services/authService'

interface AuthProviderProps {
    children: ReactNode
}

export const AuthProvider = ({
    children,
}: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const token = localStorage.getItem('accessToken')

                if (!token) {
                    setLoading(false)
                    return
                }

                const response = await getCurrentUser()

                setUser(response.data.data)
                
            } catch (error) {
                console.error(error)
                localStorage.removeItem(
                    'accessToken'
                )

                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        fetchCurrentUser()
    }, [])
    
    const login = async (
        email: string,
        password: string
    ) => {
        const response = await loginUser(email, password)

        localStorage.setItem(
            'accessToken',
            response.data.accessToken
        )

        setUser(response.data.data)
    }

    const logout = () => {
        localStorage.removeItem('accessToken')
        setUser(null)
    }

    const signup = async (
        first_name: string,
        last_name: string,
        username: string,
        email: string,
        password: string,
        password_confirmation: string
    ) => {
        await register(
            first_name,
            last_name,
            email,
            username,
            password,
            password_confirmation
        )
    }

    const value = useMemo(
        () => ({
            user,
            loading,
            isAuthenticated: !!user,
            login,
            logout,
            signup,
        }),
        [user, loading]
    )

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}