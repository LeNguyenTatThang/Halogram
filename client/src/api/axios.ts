import axios from 'axios'
import { refreshToken } from '../utils/authApi'

const BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export const configAxios = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 5000,
    withCredentials: true
})

configAxios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken')

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => Promise.reject(error)
)

configAxios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/login') &&
            !originalRequest.url?.includes('/auth/sign-up') &&
            !originalRequest.url?.includes('/auth/refresh')
        ) {
            originalRequest._retry = true

            try {
                const { accessToken } = await refreshToken()

                localStorage.setItem('accessToken', accessToken)

                originalRequest.headers.Authorization = `Bearer ${accessToken}`

                return configAxios(originalRequest)
            } catch (err) {
                localStorage.removeItem('accessToken')

                window.location.replace('/login')

                return Promise.reject(err)
            }
        }

        return Promise.reject(error)
    }
)

export default configAxios