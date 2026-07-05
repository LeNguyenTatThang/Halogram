import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Logo from '../../assets/Logo.png'

interface SignupFormProps {
    onSwitchToLogin: () => void
}

const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const { signup } = useAuth()
    const {t} = useTranslation('auth')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            alert(t('passwordMismatch') || 'Passwords do not match')
            return
        }
        setIsLoading(true)
        try {
            await signup(firstName, lastName, email, username, password, confirmPassword)
            setEmail('')
            setUsername('')
            setPassword('')
            setFirstName('')
            setLastName('')
            setConfirmPassword('')
        } catch (error) {
            console.error('Signup failed:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-md w-full mx-auto bg-white border border-gray-200 rounded-2xl p-8 shadow-md">
            <div className="text-center mb-8">
                <img src={Logo} alt="Logo" width={48} height={48} className="mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900">Halogram</h1>
                <p className="text-gray-500 mt-2">{t('registerTitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="text"
                        placeholder={t('firstName')}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}

                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <input
                        type="text"
                        placeholder={t('lastName')}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <input
                    type="email"
                    placeholder={t('email')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />

                <input 
                    type="text"
                    placeholder={t('username')}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />

                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('password')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('confirmPassword')}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-2 rounded-md focus:outline-none hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                    {isLoading ? t('signingUp') || 'Signing up...' : t('signUp') || 'Sign up'}
                </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
                {t('haveAccount')}{' '}
                <button
                    onClick={onSwitchToLogin}
                    className="text-blue-600 hover:underline font-medium"
                >
                    {t('login')}
                </button>
            </div>
        </div>
    )
}

export default SignupForm