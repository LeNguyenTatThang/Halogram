import configAxios from "../api/axios"

export const loginUser = async (email: string, password: string) => {
    const res = await configAxios.post('/auth/login', {
        email,
        password
    })
    return res.data
}

export const register = async (firstName: string, lastName: string, email: string, username: string, password: string, passwordConfirmation: string) => {
    const res = await configAxios.post('/auth/sign-up', {
        firstName,
        lastName,
        email,
        username,
        password,
        passwordConfirmation
    })
    return res.data
}

export const logout = async () => {
    const res = await configAxios.post('auth/logout')
    return res.data
}

export const getCurrentUser = async () => {
    const res = await configAxios.get('/auth/detail-user',
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            },
        }
    )
    return res.data
}

export const refeshToken = async () => {
    const res = await configAxios.post('/auth/refresh'
    )

    return res.data
}