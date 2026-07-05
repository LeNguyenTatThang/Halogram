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
        firstName: string,
        lastName: string,
        email: string,
        username: string,
        password: string,
        passwordConfirmation: string
    ) => Promise<void>
}

const AuthContext =
    createContext<AuthContextType | null>(null)

export default AuthContext