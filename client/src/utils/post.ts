import configAxios from "../api/axios"


export const createPost = async (data: FormData) => {
    const res = await configAxios.post('/post/create-post', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
    return res.data
}

export const getAllPost = async () => {
    const res = await configAxios.get('/post/list-post', {
        params: { userId: localStorage.getItem('userId') }
    })
    return res.data
}