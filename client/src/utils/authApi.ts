import axios from 'axios'

const BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const refreshAxios = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
})

export const refreshToken = async () => {
    const { data } = await refreshAxios.post('/auth/refresh')

    return data
}