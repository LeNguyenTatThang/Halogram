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
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

const UserAvatar: React.FC<UserAvatarProps> = ({ src, name, className = '', size = 40 }) => {
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`rounded-full object-cover bg-gray-100 ${className}`}
        style={{ width: size, height: size }}
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
