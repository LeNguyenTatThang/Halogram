import configAxios from "../api/axios"

export const getProfile = async (username: string) => {
    const res = await configAxios.get(`/users/${username}`)
    return res.data
}
