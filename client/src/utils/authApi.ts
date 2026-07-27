import axios from 'axios'

const BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const refreshAxios = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
})

refreshAxios.interceptors.response.use(
    (response) => {
        if (
            response.data &&
            typeof response.data === 'object' &&
            'data' in response.data
        ) {
            response.data = response.data.data
        }
        return response
    },
)

export const refreshToken = async () => {
    const { data } = await refreshAxios.post('/auth/refresh')

    return data
}