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
                const token =
                    localStorage.getItem('access_token')

                if (!token) {
                    setLoading(false)
                    return
                }

                const response =
                    await getCurrentUser()

                setUser(response.data)
            } catch (error) {
                console.error(error)
                localStorage.removeItem(
                    'access_token'
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
        const response =
            await loginUser(email, password)

        localStorage.setItem(
            'access_token',
            response.data.access_token
        )

        setUser(response.data.user)
    }

    const logout = () => {
        localStorage.removeItem('access_token')
        setUser(null)
    }

    const signup = async (
        first_name: string,
        last_name: string,
        email: string,
        password: string,
        password_confirmation: string
    ) => {
        await register(
            first_name,
            last_name,
            email,
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