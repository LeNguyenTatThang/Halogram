import axios from 'axios'
import { refeshToken } from '../utils/auth'

export const configAxios = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 5000,
    withCredentials: true
})

configAxios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token')
        if (token) config.headers.Authorization = `Bearer ${token}`
        return config
    },
    (error) => Promise.reject(error)
)

configAxios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true
            try {
                const res = await refeshToken()
                localStorage.setItem('access_token', res.access_token)
                return configAxios(originalRequest)
            } catch (err) {
                return Promise.reject(err)
            }
        }
        return Promise.reject(error)
    }
)

export default configAxios