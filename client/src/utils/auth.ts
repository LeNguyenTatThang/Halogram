import configAxios from "../api/axios"

export const loginUser = async (email: string, password: string) => {
    const res = await configAxios.post('/auth/login', {
        email,
        password
    })
    return res.data
}

export const register = async (first_name: string, last_name: string, email: string, password: string, password_confirmation: string) => {
    const res = await configAxios.post('/auth/sign-up', {
        first_name,
        last_name,
        email,
        password,
        password_confirmation
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
                Authorization: `Bearer ${localStorage.getItem('access_token')}`
            },
        }
    )
    return res.data
}

export const refeshToken = async () => {
    const res = await configAxios.post('/auth/refresh-token'
    )

    return res.data
}