"use client"
import React, { useState } from 'react'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'

const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true)

    return (
        <div className="max-w-md w-full space-y-8">
            {isLogin ? (
                <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
            ) : (
                <SignupForm onSwitchToLogin={() => setIsLogin(true)} />
            )}
        </div>
    )
}

export default AuthPage