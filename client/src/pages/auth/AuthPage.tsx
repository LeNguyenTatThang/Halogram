import React, { useState } from 'react'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'

const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true)

    return (
        <div className="max-w-md w-full h-screen flex flex-col justify-center mx-auto">
            {isLogin ? (
                <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
            ) : (
                <SignupForm onSwitchToLogin={() => setIsLogin(true)} />
            )}
        </div>
    )
}

export default AuthPage