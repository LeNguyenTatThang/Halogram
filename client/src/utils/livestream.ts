import type { Livestream, LivestreamMessage } from '../types/livestream'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const getHeaders = () => {
  const token = localStorage.getItem('accessToken')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function getActiveLivestreams(): Promise<Livestream[]> {
  const res = await fetch(`${API_BASE}/livestream/active`, {
    headers: getHeaders(),
  })
  if (!res.ok) throw new Error('Failed to fetch active livestreams')
  return res.json()
}

export async function getLivestreamById(id: string): Promise<Livestream> {
  const res = await fetch(`${API_BASE}/livestream/${id}`, {
    headers: getHeaders(),
  })
  if (!res.ok) throw new Error('Failed to fetch livestream')
  return res.json()
}

export async function getLivestreamMessages(id: string): Promise<LivestreamMessage[]> {
  const res = await fetch(`${API_BASE}/livestream/${id}/messages`, {
    headers: getHeaders(),
  })
  if (!res.ok) throw new Error('Failed to fetch messages')
  return res.json()
}

export async function createLivestream(title: string): Promise<Livestream> {
  const res = await fetch(`${API_BASE}/livestream`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ title }),
  })
  if (!res.ok) throw new Error('Failed to create livestream')
  return res.json()
}

export async function endLivestream(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/livestream/${id}/end`, {
    method: 'POST',
    headers: getHeaders(),
  })
  if (!res.ok) throw new Error('Failed to end livestream')
}
