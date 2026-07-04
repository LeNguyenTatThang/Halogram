import configAxios from '../api/axios';

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
    return await configAxios.post(
        '/auth/login',
        {
            email,
            password,
        }
    )
}

export const register = async (
first_name: string, last_name: string, email: string, username: string, password: string, password_confirmation: string) => {
    return await configAxios.post(
        '/auth/sign-up',
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
    return await configAxios.get(
        '/auth/me',
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    )
}