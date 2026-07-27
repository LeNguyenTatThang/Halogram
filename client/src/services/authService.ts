import configAxios from '../api/axios';

export interface LoginPayload {
    email: string
    password: string
}

export interface RegisterPayload {
    firstName: string
    lastName: string
    email: string
    username: string
    password: string
    passwordConfirmation: string
}

export const loginUser = async (
    email: string,
    password: string
) => {
    const res = await configAxios.post(
        '/auth/login',
        {
            email,
            password,
        }
    )
    return res.data
}

export const register = async (
    firstName: string, lastName: string, email: string, username: string, password: string, passwordConfirmation: string) => {
    const res = await configAxios.post(
        '/auth/sign-up',
        {
            firstName,
            lastName,
            email,
            username,
            password,
            passwordConfirmation,
        }
    )
    return res.data
}

export const getCurrentUser = async () => {
    const token = localStorage.getItem('accessToken')
    const res = await configAxios.get(
        '/auth/me',
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    )
    return res.data
}