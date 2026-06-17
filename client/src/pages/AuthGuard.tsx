import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

export default function AuthGuard({
    children,
}: {
    children: React.ReactNode
}) {
    const { isAuthenticated, loading } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate("/login")
        }
    }, [loading, isAuthenticated, navigate])

    if (loading || !isAuthenticated) {
        return <div>Loading...</div>
    }

    return <>{children}</>
}