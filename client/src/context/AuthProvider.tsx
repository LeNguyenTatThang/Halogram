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

                setUser(response.data)
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
        firstName: string,
        lastName: string,
        email: string,
        username: string,
        password: string,
        passwordConfirmation: string
    ) => {
        await register(
            firstName,
            lastName,
            email,
            username,
            password,
            passwordConfirmation
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