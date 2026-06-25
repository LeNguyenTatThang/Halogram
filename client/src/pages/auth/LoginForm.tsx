import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Logo from '../../assets/Logo.png'
interface LoginFormProps {
    onSwitchToSignup: () => void
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup }) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const {t} = useTranslation('auth')
    const { login } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            await login(email, password)
        } catch (error) {
            console.error('Login failed:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-md w-full mx-auto bg-white border border-gray-300 rounded-lg p-8">
            <div className="text-center mb-8">
                <img
                    src={Logo}
                    alt="Logo"
                    width={48}
                    height={48}
                    className="mx-auto mb-4 h-12 w-12"
                />
                <h1 className="text-2xl font-bold text-gray-900">Halogram</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <input
                        type="text"
                        placeholder={t('emailOrUsername')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                    />
                </div>

                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('password')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? `${t('loggingIn')}...` : `${t('login')}`}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-gray-600">
                    {t('noAccount')}{' '}
                    <button
                        onClick={onSwitchToSignup}
                        className="text-blue-500 hover:text-blue-600 font-medium cursor-pointer"
                    >
                        {t('register')}
                    </button>
                </p>
            </div>
        </div>
    )
}

export default LoginForm