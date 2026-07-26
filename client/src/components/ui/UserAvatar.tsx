import { useState } from 'react'

interface UserAvatarProps {
  src?: string | null
  name?: string | null
  className?: string
  size?: number
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('')
}

const UserAvatar = ({ src, name, className = '', size = 40 }: UserAvatarProps) => {
  const [imgError, setImgError] = useState(false)

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`rounded-full object-cover bg-gray-100 ${className}`}
        style={{ width: size, height: size }}
        onError={() => setImgError(true)}
      />
    )
  }

  const initials = getInitials(name || '?')

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white select-none ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: 'linear-gradient(135deg, #ff66c4, #ffde59)',
      }}
    >
      {initials}
    </div>
  )
}

export default UserAvatar
