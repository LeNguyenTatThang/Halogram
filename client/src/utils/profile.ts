import configAxios from "../api/axios"

export const getProfile = async (username: string) => {
    const res = await configAxios.get(`/users/${username}`)
    return res.data
}

export const updateProfile = async (data: FormData) => {
    const res = await configAxios.patch('/users/me', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
}
