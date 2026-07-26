interface VerifiedShopBadgeProps {
  className?: string
}

const VerifiedShopBadge: React.FC<VerifiedShopBadgeProps> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`w-4 h-4 text-blue-500 inline-block ${className}`}
    >
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  )
}

export default VerifiedShopBadge
