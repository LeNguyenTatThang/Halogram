import {configAxios} from '../api/axios'

export const searchUsers = async (keyword: string, cursor?: string | null) => {
    const res = await configAxios.get('/users/search', {
        params: { keyword, cursor }
    })

    return res.data
}