import configAxios from '../api/axios'

export const followUser = async (followingId: string) => {
  const res = await configAxios.post('/follows/follow', { followingId })
  return res.data
}

export const unfollowUser = async (followingId: string) => {
  const res = await configAxios.delete('/follows/unfollow', {
    data: { followingId },
  })
  return res.data
}
