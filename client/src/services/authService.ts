import axios from 'axios'

const API_URL = import.meta.env.VITE_API_BASE_URL

export interface LoginPayload {
    email: string
    password: string
}

export interface RegisterPayload {
    first_name: string
    last_name: string
    email: string
    username: string
    password: string
    password_confirmation: string
}

export const loginUser = async (
    email: string,
    password: string
) => {
    return await axios.post(
        `${API_URL}/auth/login`,
        {
            email,
            password,
        }
    )
}

export const register = async (
first_name: string, last_name: string, email: string, username: string, password: string, password_confirmation: string) => {
    return await axios.post(
        `${API_URL}/auth/sign-up`,
        {
            first_name,
            last_name,
            email,
            username,
            password,
            password_confirmation,
        }
    )
}

export const getCurrentUser = async () => {
    const token = localStorage.getItem('accessToken')
    return await axios.get(
        `${API_URL}/auth/me`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    )
}