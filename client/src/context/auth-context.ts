import { createContext } from 'react'
import type { User } from '../types/User'

export interface AuthContextType {
    user: User | null
    loading: boolean
    isAuthenticated: boolean

    login: (
        email: string,
        password: string
    ) => Promise<void>

    logout: () => void

    signup: (
        first_name: string,
        last_name: string,
        email: string,
        password: string,
        password_confirmation: string
    ) => Promise<void>
}

const AuthContext =
    createContext<AuthContextType | null>(null)

export default AuthContext