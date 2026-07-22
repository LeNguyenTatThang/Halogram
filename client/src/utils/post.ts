import configAxios from "../api/axios"


export const createPost = async (data: FormData) => {
    const res = await configAxios.post('/post/create-post', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
    return res.data
}

export const getAllPost = async (cursor?: string) => {
    const res = await configAxios.get("/post/list-post", {
        params: { cursor }
    })
    return res.data
}

export const getUserPosts = async (userId: string, cursor?: string) => {
    const res = await configAxios.get(`/post/user/${userId}`, {
        params: { cursor }
    })
    return res.data
}

export const getSavedPosts = async (cursor?: string) => {
    const res = await configAxios.get('/post/saved', {
        params: { cursor }
    })
    return res.data
}

export const toggleSavePost = async (postId: string) => {
    const res = await configAxios.post(`/post/${postId}/save`)
    return res.data
}

export const getTaggedPosts = async (userId: string, cursor?: string) => {
    const res = await configAxios.get(`/post/tagged/${userId}`, {
        params: { cursor }
    })
    return res.data
}