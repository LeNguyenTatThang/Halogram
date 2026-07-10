import configAxios from "../api/axios"

export const likePost = async (postId: string) => {
    const res = await configAxios.post('/likes/toggle-like', { postId: postId })

    return res.data
}