import configAxios from "../api/axios";

export const getComments = async (postId: string) => {
    const res = await configAxios.get('/comments/get-comments', {params: {postId}})

    return res.data
}

export const createComment = async (postId: string, comment: string) => {
    const res = await configAxios.post('/comments/create-comment', {postId, comment})

    return res.data
}