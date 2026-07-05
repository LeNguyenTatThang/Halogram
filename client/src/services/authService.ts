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
    return await configAxios.post(
        '/auth/login',
        {
            email,
            password,
        }
    )
}

export const register = async (
firstName: string, lastName: string, email: string, username: string, password: string, passwordConfirmation: string) => {
    return await configAxios.post(
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