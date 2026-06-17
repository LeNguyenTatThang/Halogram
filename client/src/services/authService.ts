import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export interface LoginPayload {
    email: string
    password: string
}

export interface RegisterPayload {
    first_name: string
    last_name: string
    email: string
    password: string
    password_confirmation: string
}

export const loginUser = async (
    email: string,
    password: string
) => {
    return await axios.post(
        `${API_URL}/login`,
        {
            email,
            password,
        }
    )
}

export const register = async (
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    password_confirmation: string
) => {
    return await axios.post(
        `${API_URL}/register`,
        {
            first_name,
            last_name,
            email,
            password,
            password_confirmation,
        }
    )
}

export const getCurrentUser = async () => {
    const token = localStorage.getItem('access_token')

    return await axios.get(
        `${API_URL}/me`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    )
}